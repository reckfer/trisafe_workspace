'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Alert,
    View,
    Text
} from 'react-native';
import { Button, Card } from 'react-native-elements';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import Orientation from 'react-native-orientation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import RNFetchBlob from 'rn-fetch-blob';
import { StackActions } from '@react-navigation/native';

const NOME_COMPONENTE = 'TelaContratacaoPrincipal';
const INSTRUCAO_INICIAL = 'Contrato de serviço de rastreamento.';

export default class TelaContratacaoPrincipal extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.incluirContrato = this.incluirContrato.bind(this);
        this.tratarIncluirContrato = this.tratarIncluirContrato.bind(this);
        this.voltar = this.voltar.bind(this);
    }
    
    componentDidMount() {
        let nomeFuncao = 'componentDidMount';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        Orientation.unlockAllOrientations();

        if(this.oGerenciadorContextoApp.temDados()) {
            
            if(!this.oDadosContrato.url_doc) {
                this.incluirContrato();
            }
        }
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    incluirContrato() {
        try {
            let metodoURI = '/contratos/incluir_com_signatario/';
            let oDadosRequisicao = {
                cliente: this.oDadosCliente,
                contrato: this.oDadosContrato,
            }
            
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarIncluirContrato);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarIncluirContrato(oDados, oEstado) {
        let nomeFuncao = 'tratarIncluirContrato';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        if(oEstado.ok) {
            this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
            this.oGerenciadorContextoApp.atribuirDados('cliente', oDados.cliente);
            this.oGerenciadorContextoApp.atribuirDados('boleto', oDados.boleto);
            
            let oCliente = this.oDadosApp.cliente;
            
            if(!this.oDadosContrato.aceito && oCliente && oCliente.id_signatario_contrato && oCliente.id_signatario_contrato.indexOf('|-|') > 0) {
                let partesSignatario = oCliente.id_signatario_contrato.split('|-|');
                
                if(partesSignatario && partesSignatario.length > 1) {

                    this.oDadosContrato.url_doc = `https://sandbox.clicksign.com/sign/${partesSignatario[1]}`;
                }

                this.oRegistradorLog.registrar('URL do contrato: ', this.oDadosContrato.url_doc);

                if(this.oDadosContrato.url_doc) {
                    
                    const pop = StackActions.pop(1);
                
                    console.log('Removendo tela atual...', JSON.stringify(pop));
                    this.oNavegacao.dispatch(pop);

                    this.oNavegacao.navigate('Fluxo Modais', { screen: 'Contrato Clicksign' });
                } else {

                    this.oRegistradorLog.registrar('Não foi possível obter o link do contrato.');

                    Alert.alert('TriSafe', 'Não foi possível obter o link do contrato. Enviamos uma cópia por e-mail. Por favor, verifique seu e-mail');
                }
            }
        }
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    voltar() {

        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoPronto = () => <Button title="Pronto" loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoPronto } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Contrataçâo' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp} navigation={this.oNavegacao}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaContratacaoPrincipal.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this);

        this.montarIcone = this.montarIcone.bind(this);
        this.baixarContrato = this.baixarContrato.bind(this);
        this.baixarBoleto = this.baixarBoleto.bind(this);
    }

    montarIcone(nomeIcone, descricao, oFuncaoOnPress, oFuncaoOnLongPress, habilitado) {
        let corIcone = '#009999';

        if(!habilitado) {
            corIcone = '#e0ebeb';
        }
        if(descricao) {
            return (
                <TouchableOpacity onPress={oFuncaoOnPress} >
                    <View style={{flexDirection:'column', width:65, marginRight:10, marginLeft:10, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={30} color={corIcone} />
                        <Text style={{color:corIcone}}>{descricao}</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={oFuncaoOnPress} onLongPress={oFuncaoOnLongPress}>
                    <View style={{flexDirection:'column', width:50, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                    </View>
                </TouchableOpacity>
            )
        }
    }

    baixarContrato() {
        
        let nome_prefixo = 'Contrato_Trisafe';
        let tipoArquivo = 'docx';
        let tipoMidia  = 'application/msword';
        let url = this.oDadosApp.contrato.url_doc;

        if(this.oDadosApp.contrato.url_pdf) {
            nome_prefixo = 'Contrato_Trisafe_Assinado';
            tipoArquivo = 'pdf';
            tipoMidia  = 'application/pdf';
            url = this.oDadosApp.contrato.url_pdf;
        }

        RNFetchBlob
        .config({
            fileCache : true,
            appendExt: tipoArquivo,
        })
        .fetch('GET', url)
        .then((res) => {
            let caminhoLocal = res.path();
            // the temp file path
            console.log('The file saved to ', caminhoLocal);
            console.log('Caminho downloads:', RNFetchBlob.fs.dirs.DownloadDir);
            
            let nomeArquivo = `${nome_prefixo}_${this.oDadosApp.contrato.id_contrato}.${tipoArquivo}`;
            let caminhoArquivoDestino = `${RNFetchBlob.fs.dirs.DownloadDir}/${nomeArquivo}`;
            
            RNFetchBlob.android.actionViewIntent(caminhoLocal, tipoMidia)
            .then((valor) => {
                console.log(valor);
            }).catch((e) => {
                this.oUtil.tratarExcecao(e);    
            });

            RNFetchBlob.fs.cp(caminhoLocal, caminhoArquivoDestino).then((resultado) => {
                console.log('Arquivo movido: ', resultado);
                Alert.alert('TriSafe', `Seu contrato salvo. Verifique na pasta Downloads o arquivo ${nomeArquivo}.`);
            }).catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        }).catch((e) =>{
            this.oUtil.tratarExcecao(e);
        })
    };

    baixarBoleto() {
        
        let nome_prefixo = 'Boleto_Trisafe';
        let tipoArquivo = 'pdf';
        let tipoMidia  = 'application/pdf';
        let url = this.oDadosApp.boleto.url_pdf;

        RNFetchBlob
        .config({
            fileCache : true,
            appendExt: tipoArquivo,
        })
        .fetch('GET', url)
        .then((res) => {
            let caminhoLocal = res.path();
            // the temp file path
            console.log('Caminho arquivo local: ', caminhoLocal);
            console.log('Caminho downloads:', RNFetchBlob.fs.dirs.DownloadDir);
            
            let nomeArquivo = `${nome_prefixo}_${this.oDadosApp.contrato.id_contrato}.${tipoArquivo}`;
            let caminhoArquivoDestino = `${RNFetchBlob.fs.dirs.DownloadDir}/${nomeArquivo}`;
            
            RNFetchBlob.android.actionViewIntent(caminhoLocal, tipoMidia)
            .then((valor) => {
                console.log(valor);
            }).catch((e) => {
                this.oUtil.tratarExcecao(e);    
            });

            RNFetchBlob.fs.cp(caminhoLocal, caminhoArquivoDestino).then((resultado) => {
                console.log('Arquivo movido: ', resultado);
                Alert.alert('TriSafe', `Seu contrato salvo. Verifique na pasta Downloads o arquivo ${nomeArquivo}.`);
            }).catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        }).catch((e) =>{
            this.oUtil.tratarExcecao(e);
        })
    };

    render() {
        let oDadosApp = this.props.dadosApp;
        let oNavegacao = this.props.navigation;
        let oDadosContrato = oDadosApp.contrato;
        let areaContrato = (
                        <View>
                            <Text>Buscando contrato. Aguarde...</Text>
                        </View>);

        
        console.log('oDadosContrato.url_doc... ', oDadosContrato.url_doc);
        
        if(oDadosContrato.aceito) {

        areaContrato = <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <Text>Obrigado por contratar a TriSafe...</Text>
            <Card key={1} 
                title='Contrato'
                containerStyle={{backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5, flexDirection:'column', width:'90%'}} 
            >
                <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly' }}>
                    {this.montarIcone('download', 'Baixar', () => {this.oConfiguracao.solicitarPermissaoArmazenamento(this.baixarContrato);}, () => {}, true)}
                    {this.montarIcone('file-o', 'Visualizar', () => {oNavegacao.navigate('Fluxo Modais', { screen: 'Contrato Clicksign' });}, () => {}, true)}
                </View>
            </Card>
            <Card key={2} 
                title='Boleto'
                containerStyle={{backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5, flexDirection:'column', width:'90%'}} 
            >
                <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly' }}>
                    {this.montarIcone('download', 'Baixar', () => {this.oConfiguracao.solicitarPermissaoArmazenamento(this.baixarBoleto);}, () => {}, true)}
                    {this.montarIcone('file-o', 'Visualizar', () => {oNavegacao.navigate('Fluxo Modais', { screen: 'Boleto Gerencianet' });}, () => {}, true)}
                </View>
            </Card>
        </View>
    }
    
    return (
        <View style={styles.areaDadosCliente}>
            {areaContrato}
        </View>
    );}
}
AreaDados.contextType = ContextoApp;