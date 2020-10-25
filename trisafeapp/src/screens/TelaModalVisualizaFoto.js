'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    ImageBackground,
} from 'react-native';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import { styles } from '../common/Estilos';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { clonarObjeto, DADOS_FOTO } from '../contexts/DadosAppGeral';
import { StackActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaModalVisualizaFoto';
const INSTRUCAO_INICIAL = 'A foto ficou nítida?';

export default class TelaModalVisualizaFoto extends Component {
    
    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.salvar = this.salvar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.capturarNovamente = this.capturarNovamente.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.definirDadosPadraoTela = this.definirDadosPadraoTela.bind(this);
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
    
        this.registrarEventoFoco();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    registrarEventoFoco() {
	
        this.oNavegacao.addListener('focus', this.definirDadosPadraoTela);
    }
    
    definirDadosPadraoTela() {
        Orientation.lockToLandscapeLeft();
        
        let nomeFuncao = 'definirDadosPadraoTela';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        this.oDadosControleApp.manter_tela_na_horizontal = true;

        if(this.oDadosControleApp.abrir_camera) {
            
            this.oUtil.exibirMensagem('Preparando câmera...', false, null, true);
            
            // Aguarda 2 segundos com a intencao de garantir que a tela fique na horizontal antes de renderizar a mascara.
            setTimeout(() => {
                this.voltar();
                this.oUtil.fecharMensagem();
            }, 2000);
        } else {
            this.oDadosInstrucao.texto_instrucao = INSTRUCAO_INICIAL;
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    salvar() {
        try {
            let metodoURI = '/clientes/salvar_foto_cnh/';
            let oDadosRequisicao = {
                cliente: this.oDadosCliente
            }

            if(this.oDadosControleApp.cadastrando_veiculo) {
                metodoURI = '/veiculos/salvar_foto_doc/';

                oDadosRequisicao = {
                    veiculo: this.oDadosVeiculoAtual,
                }
                oDadosRequisicao.veiculo.cliente = this.oDadosCliente;
            }
            
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosRetorno, false, false);

        } catch (oExcecao) {

            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        let url_foto_cliente = this.oDadosCliente.foto_cnh.url;
        let url_foto_veiculo_atual = this.oDadosVeiculoAtual.foto_doc.url;

        // Limpa os dados nas referencias de veiculo atual.
        this.oDadosApp.veiculo = clonarObjeto(DADOS_VEICULO);
        this.oDadosVeiculoAtual = this.oDadosApp.veiculo;

        // Limpa os dados das fotos.
        this.oDadosCliente.foto_cnh = clonarObjeto(DADOS_FOTO);
        //this.oDadosVeiculoAtual.foto_doc = clonarObjeto(DADOS_FOTO);
        this.oDadosApp.foto = clonarObjeto(DADOS_FOTO);
        
        // Mantem as URLs das ultimas fotos tiradas, para indicar que as fotos ja foram tiradas.
        this.oDadosCliente.foto_cnh.url = url_foto_cliente;
        this.oDadosVeiculoAtual.foto_doc = url_foto_veiculo_atual;

        let oFuncaoMensagem = null;
        
        if(oEstado.ok) {
            oFuncaoMensagem = this.avancar;
        }
        
        this.oUtil.exibirMensagem(oEstado.mensagem, true, oFuncaoMensagem);
    }

    avancar() {
        let proximaTela = 'Contratacao';

        if(this.oDadosControleApp.cadastrando_cliente || this.oDadosControleApp.cadastrando_veiculo) {
            proximaTela = 'Veiculo Inicio';
        }
        this.oDadosControleApp.cadastrando_cliente = false;
        this.oDadosControleApp.cadastrando_veiculo = false;
        
        const pop = StackActions.pop(1);

        console.log('Removendo tela de visualizacao de foto...', JSON.stringify(pop));
        this.oNavegacao.dispatch(pop);

        console.log('Navegando para a tela...', proximaTela);

        Orientation.unlockAllOrientations();
        this.oNavegacao.navigate('Cadastro', { screen: proximaTela });
    }
    
    capturarNovamente() {
        
        this.voltar();
    }

    voltar() {
        const pop = StackActions.pop(1);
                
        console.log('Removendo tela visualizacao de imagem...', JSON.stringify(pop));
        this.oNavegacao.dispatch(pop);

        const push = StackActions.push('Cadastro', { screen: 'Captura Foto' });

        this.oNavegacao.dispatch(push);
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    
    render() {
        
        if(this.oDadosFoto.foto_base64) {

            console.log('Vai renderizar foto tirada...');

            let estiloAreaFoto =  {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
            }
            let estiloFoto =  {
                flex: 1,
            }

            return(
                <SafeAreaView style={styles.areaCliente}>
                    <View style={estiloAreaFoto}>
                        <ImageBackground source={ { uri: `data:image/png;base64,${this.oDadosFoto.foto_base64}` }} 
                            style={estiloFoto}>
                            <View style={{flex:1, flexDirection:'column', justifyContent:'space-between'}}>
                                <View style={{flex:.2, backgroundColor:'black', opacity: .7, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                                    <TouchableOpacity onPress={this.capturarNovamente} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center'}} >
                                        <Icon name="arrow-left" size={30} color="white" style={{margin:10}}/>
                                        <Text style={{color:'white', fontSize:16}}>Tirar outra</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={this.salvar} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                                        <Text style={{color:'white', fontSize:16}}>Está nítida</Text>
                                        <Icon name="arrow-right" size={30} color="white" style={{margin:10}} />
                                    </TouchableOpacity> 
                                </View>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                                    <View style={{width:"17%", backgroundColor:'black', opacity: .7}}>
                                                
                                    </View>
                                    <View style={{width:"17%",  backgroundColor:'black', opacity: .7, justifyContent:'center', alignItems:'center'}}>
                                       
                                    </View>
                                </View>
                                <View style={{flex:.1, flexDirection:'column',  backgroundColor:'black', opacity: .7}}>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                </SafeAreaView>
            );
        } else {
            this.oDadosControleApp.abrir_camera = true;
            return(
                <View style={styles.areaCliente}>
                    <Text>Abrindo camera...</Text>
                </View>
            );
        }
    }
}
TelaModalVisualizaFoto.contextType = ContextoApp;