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
import { inicializarContextoComum } from '../common/Util';
import { styles } from '../common/Estilos';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';
import { StackActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaModalVisualizaFotoCNH';
const INSTRUCAO_INICIAL = 'A foto ficou nítida?';

export default class TelaModalVisualizaFotoCNH extends Component {
    
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.enviarFotoCNHServidor = this.enviarFotoCNHServidor.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.capturarNovamente = this.capturarNovamente.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        Orientation.lockToLandscapeLeft();

        if(this.oDadosControleApp.abrir_camera) {
            this.voltar();
        }

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    componentWillUnmount() {
        this.registrarEventoFoco();
    }

    registrarEventoFoco() {
        this.oNavegacao.addListener('focus', () => {
            Orientation.lockToLandscapeLeft();
        });
    }

    enviarFotoCNHServidor() {
        try {
            let metodoURI = '/clientes/salvar_foto_cnh/';

            let oParametrosFoto = {
                dados_app: {
                    cliente: this.oDadosApp.cliente,
                    fotos: this.oDadosApp.fotos,
                    chaves: this.oDadosApp.chaves,
                }
            }

            let oDadosParametros = JSON.stringify(oParametrosFoto);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno, false, false);

        } catch (oExcecao) {

            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oDadosApp.fotos = clonarObjeto(DADOS_FOTOS);

        let oFuncaoMensagem = () => {};
        
        if(oEstado.ok) {
            oFuncaoMensagem = this.avancar;
        }

        this.oUtil.exibirMensagemUsuario(oEstado.mensagem, oFuncaoMensagem);
    }

    avancar() {
        Orientation.unlockAllOrientations();

        this.oNavegacao.navigate('Contratacao');
    }
    
    capturarNovamente() {
        
        this.voltar();
    }

    voltar() {
        this.oDadosApp.fotos = clonarObjeto(DADOS_FOTOS);
        const pop = StackActions.pop(1);
                
        console.log('Removendo tela imagem CNH...', JSON.stringify(pop));
        this.oNavegacao.dispatch(pop);

        const push = StackActions.push('Fluxo Cadastro Cliente', { screen: 'Foto CNH' });

        this.oNavegacao.dispatch(push);
        // this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        
        if(this.oDadosApp.fotos.foto_cnh_base64) {

            console.log('Vai renderizar foto tirada...');
            //let estiloAreaFoto = clonarObjeto(styles.areaCliente);
            // estiloAreaFoto.flex = 1
            // estiloAreaFoto.justifyContent= 'center';
            // estiloAreaFoto.alignItems = 'center';
            // estiloAreaFoto.backgroundColor = 'green';
            // estiloAreaFoto.margin = 30;
            // estiloAreaFoto.marginTop = 50;
            // estiloAreaFoto.marginRight = 60;

            let estiloAreaFoto =  {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                // flexDirection: 'column',
                // justifyContent: 'flex-start',
                //alignItems: 'center',
                //backgroundColor: '#f5f5f5',
               // padding: 50,
            }
            let estiloFoto =  {
                flex: 1,
                //transform: [{ rotate: '90deg' }]
                // flexDirection: 'column',
                // justifyContent: 'center',
                // alignItems: 'center',
                //backgroundColor: '#f5f5f5',
               // padding: 50,
            }

            return(
                <SafeAreaView style={styles.areaCliente}>
                    <View style={estiloAreaFoto}>
                        <ImageBackground source={ { uri: `data:image/png;base64,${this.oDadosApp.fotos.foto_cnh_base64}` }} 
                            style={estiloFoto}>
                            <View style={{flex:1, flexDirection:'column', justifyContent:'space-between'}}>
                                <View style={{flex:.2, backgroundColor:'black', opacity: .7, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                                    <TouchableOpacity onPress={this.capturarNovamente} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center'}} >
                                        <Icon name="arrow-left" size={30} color="white" style={{margin:10}}/>
                                        <Text style={{color:'white', fontSize:16}}>Tirar outra</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={this.enviarFotoCNHServidor} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
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
TelaModalVisualizaFotoCNH.contextType = ContextoApp;