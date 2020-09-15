'use strict';
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
    View
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { ThemeProvider, Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
// import { WebView } from 'react-native-webview';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaRodape from './../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import Orientation from 'react-native-orientation';

export default class TelaBoletoEmissao extends Component {
	
    constructor(props, value) {
        super(props);
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaBoletoEmissao.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterBoleto = this.obterBoleto.bind(this);
        this.tratarRetornoBoleto = this.tratarRetornoBoleto.bind(this);
        this.finalizar = this.finalizar.bind(this);
        this.tratarRetornoEmail = this.tratarRetornoEmail.bind(this);
        this.voltar = this.voltar.bind(this);

        this.texto_instrucao = 'Contratação finalizada. Obrigado.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;

        this.oRegistradorLog.registrar('TelaBoletoEmissao.constructor() => Finalizou.');
    }

    componentDidMount() {
        
        Orientation.unlockAllOrientations();
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(this.oGerenciadorContextoApp.temDados()) {
            this.obterBoleto();
        }
    }

    obterBoleto() {
        try {
            let metodoURI = '/boletogerencianets/obter/';

            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarRetornoBoleto, true);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);

        }
    }

    tratarRetornoBoleto(oDados) {
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados, this);
    }

    finalizar() {
        try {
            let metodoURI = '/emailclientes/enviar_com_anexos/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarRetornoEmail);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarRetornoEmail() {
        
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoFinalizar = () => <Button title="Finalizar" onPress={this.finalizar} loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoFinalizar } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Boleto' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

TelaBoletoEmissao.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosBoleto = oDadosApp.boleto;
        const source = { 'uri': '' };

        if(oDadosBoleto.url_pdf) {
            source.uri = oDadosBoleto.url_pdf;
        }
        return (
            <View style={styles.areaDadosCliente}>
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath)=>{
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                    }}
                    onError={(error)=>{
                        if(source.uri) {
                            this.oComunicacaoHTTP.obterJsonResposta(error);
                        }
                    }}
                    onPressLink={(uri)=>{
                    }}
                    style={{
                        flex:1,
                        width:Dimensions.get('window').width,
                        height:Dimensions.get('window').height,
                    }}
                />
            </View>
        );
    }
}