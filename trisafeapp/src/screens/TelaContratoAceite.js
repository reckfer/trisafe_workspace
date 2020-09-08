/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Dimensions,
    Alert,
    View,
    Text
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';

export default class TelaContratoAceite extends Component {
	
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaContratoAceite.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util();
            this.oDadosControleApp.processando_requisicao = false;
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterArquivoContrato = this.obterArquivoContrato.bind(this);
        this.contratar = this.contratar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.voltar = this.voltar.bind(this);

        this.texto_instrucao = 'Contrato de serviço de rastreamento.'
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaContratoAceite.constructor() => Finalizou.');
    }
    
    componentDidMount() {
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(this.oGerenciadorContextoApp.temDados()) {
            this.obterArquivoContrato();
        }
    }

    obterArquivoContrato() {
        this.oDadosApp.contrato.url_pdf = this.oComunicacaoHTTP.getURL('/contratos/obter_arquivo_contrato/');
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    contratar() {
        try {
            let metodoURI = '/contratos/aceitar/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados);

        if(oEstado.ok) {
            this.oNavegacao.navigate('Boleto', this.state);
        }
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoContratar = () => <Button title="Contratar" onPress={this.contratar} loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoContratar } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Contrato' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaContratoAceite.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, value) {
        super(props);
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaContratoAceite.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
            this.oUtil = new Util();
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.excluirArquivoContrato = this.excluirArquivoContrato.bind(this);
    }

    excluirArquivoContrato() {
        try {
            
            let metodoURI = '/contratos/excluir_arquivo_contrato/';
            
            let oDadosParametros = JSON.stringify(this.state);
            
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, null, true);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosContrato = oDadosApp.contrato;
        let areaContrato = <View><Text>Gerando o contrato. Aguarde...</Text></View>

        if(oDadosContrato.url_pdf) {
            let oDadosParametros = JSON.stringify({
                    'dados_app' : oDadosApp,
                });

            let parametrosHTTPS = this.oComunicacaoHTTP.getParametrosHTTPS(oDadosParametros);
            parametrosHTTPS.uri = oDadosContrato.url_pdf;
            const source = parametrosHTTPS;
        
            areaContrato = <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath)=>{
                        console.log('render() onLoadComplete', filePath);
                        this.excluirArquivoContrato();
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                        console.log('render() onPageChanged', page);
                    }}
                    onError={(error, a)=>{
                        console.log('render() onError', error);
                        this.oComunicacaoHTTP.obterJsonResposta(error);
                    }}
                    onPressLink={(uri)=>{
                    }}
                    style={{
                        flex:1,
                        width:Dimensions.get('window').width,
                        height:Dimensions.get('window').height,
                    }}
                />
        }
        return (
            <View style={styles.areaDadosCliente}>
                {areaContrato}
            </View>
        );
    }
}
AreaDados.contextType = ContextoApp;