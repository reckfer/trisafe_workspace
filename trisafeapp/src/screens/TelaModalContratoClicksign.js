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
    Text, Dimensions
} from 'react-native';
import { Button } from 'react-native-elements';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import Orientation from 'react-native-orientation';
import WebView from 'react-native-webview';
import Pdf from 'react-native-pdf';
import { StackActions } from '@react-navigation/native';

const NOME_COMPONENTE = 'TelaModalContratoClicksign';
const INSTRUCAO_INICIAL = 'Contrato de serviço de rastreamento.';

export default class TelaModalContratoClicksign extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
                
        this.incluirContrato = this.incluirContrato.bind(this);
        this.tratarIncluirContrato = this.tratarIncluirContrato.bind(this);
        this.contratado = this.contratado.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.voltar = this.voltar.bind(this);
    }
    
    componentDidMount() {
        let nomeFuncao = 'componentDidMount';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        // Orientation.unlockAllOrientations();

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
            
            let oCliente = this.oDadosApp.cliente;
            let oDadosContrato = this.oDadosApp.contrato;

            if(oCliente && oCliente.id_signatario_contrato && oCliente.id_signatario_contrato.indexOf('|-|') > 0) {
                let partesSignatario = oCliente.id_signatario_contrato.split('|-|');
                
                if(partesSignatario && partesSignatario.length > 1) {

                    oDadosContrato.url_doc = `https://sandbox.clicksign.com/sign/${partesSignatario[1]}`;
                }
            }

            this.oRegistradorLog.registrar('URL do contrato: ', oDadosContrato.url_doc);

            if(!oDadosContrato.url_doc) {
                
                this.oRegistradorLog.registrar('Não foi possível obter o link do contrato.');
                this.oUtil.exibirMensagem('Não foi possível obter o link do contrato. Enviamos uma cópia por e-mail. Por favor, verifique seu e-mail', true);
            }

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    // obterURLContrato() {

    //     try {
    //         let metodoURI = '/contratos/obter_url_contrato_docx/';
            
    //         let oDadosParametros = JSON.stringify(this.state);

    //         this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarObterURLContrato);

    //     } catch (oExcecao) {
    //         this.oUtil.tratarExcecao(oExcecao);
    //     }
    // }

    // tratarObterURLContrato(oDados, oEstado) {
        
    //     if(oEstado.ok && oDados) {
    //         this.oDadosApp.contrato.url_doc = oDados;
    //         this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    //     }
    // }

    contratado() {
        try {
            let metodoURI = '/contratos/aceitar/';
            
            let oDadosRequisicao = {
                cliente: this.oDadosCliente,
                contrato: this.oDadosContrato,
            }

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosRetorno);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        if(oDados) {
            this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
            this.oGerenciadorContextoApp.atribuirDados('cliente', oDados.cliente);
            this.oGerenciadorContextoApp.atribuirDados('boleto', oDados.boleto);
        }

        if(oEstado.ok) {
            this.oDadosApp.contrato.url_doc = '';
            const pop = StackActions.pop(1);
                
            console.log('Removendo tela contrato clicksign...', JSON.stringify(pop));
            this.oNavegacao.dispatch(pop);

            const push = StackActions.push('Cadastro', { screen: 'Contratacao' });

            this.oNavegacao.dispatch(push);
        }
    }

    voltar() {

        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoPronto = () => <Button title="Pronto" onPress={this.contratado} loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoPronto } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Contratacao' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaModalContratoClicksign.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosContrato = oDadosApp.contrato;
        let areaContrato = <View><Text>Gerando o contrato. Aguarde...</Text></View>

        console.log('oDadosContrato.url_doc... ', oDadosContrato.url_doc);
        console.log('oDadosContrato.url_pdf... ', oDadosContrato.url_pdf);
        if(oDadosContrato.url_doc) {
        
            areaContrato = <WebView source={{ uri: `${oDadosContrato.url_doc}` }}></WebView>

            // areaContrato = <WebView source={{ html:`<!DOCTYPE html>
            // <html>
            //   <head>
            //     <meta charset="UTF-8">
            //     <meta name="viewport" content="width=device-width, initial-scale=1">
            //     <title>Simple widget usage</title>
            //     <script src='embedded.js'></script>
            //   </head>
            
            //   <body>
            //     <input id='request_signature_key' />
            //     <input type='button' value='Load' onclick='run()'/>
            //     <div id='container' style='height: 100%'>
            //         <iframe style='height: 100%' src="https://docs.google.com/gview?url=${oDadosContrato.url_doc}"></iframe>
            //     </div>
            
            //     <script type='text/javascript'>
            //       var widget,
            //           input = document.getElementById('request_signature_key');
            
            //       function run () {
            //         var request_signature_key = input.value;
            
            //         if(widget) { widget.unmount(); }
            
            //         widget = new Clicksign(request_signature_key);
            
            //         widget.endpoint = '${oDadosContrato.url_doc}';
            //         widget.origin = 'http://www.seusite.com.br';
            //         widget.mount('container');
            
            //         widget.on('loaded', function(ev) { console.log('loaded!'); });
            //         widget.on('signed', function(ev) { console.log('signed!'); });
            //         widget.on('resized', function(height) {
            //           console.log('resized!');
            //           document.getElementById('container').style.height = height+'px';
            //         });
            //       };
            //     </script>
            //   </body>
            // </html>` }}></WebView>
        } else {
            
            const source = { 'uri': '' };

            if(oDadosContrato.url_pdf) {
                source.uri = oDadosContrato.url_pdf;
            }
            areaContrato = <Pdf
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
        }
        return (
            <View style={styles.areaDadosCliente}>
                {areaContrato}
            </View>
        );
    }
}
AreaDados.contextType = ContextoApp;