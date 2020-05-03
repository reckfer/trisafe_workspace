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
import Util from './../common/Util';
import { ThemeProvider, Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
// import { WebView } from 'react-native-webview';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaBotoes from './../common/AreaBotoes';
import { ContextoApp } from '../contexts/ContextoApp';

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
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterBoleto = this.obterBoleto.bind(this);
        this.tratarRetornoBoleto = this.tratarRetornoBoleto.bind(this);
        this.finalizar = this.finalizar.bind(this);
        this.tratarRetornoEmail = this.tratarRetornoEmail.bind(this);
        this.voltar = this.voltar.bind(this);

        this.oRegistradorLog.registrar('TelaBoletoEmissao.constructor() => Finalizou.');
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(this.oGerenciadorContextoApp.temDados()) {
            this.obterBoleto();
        }
    }

    obterBoleto() {
        try {
            let url = this.oUtil.getURL('/boletogerencianets/obter/');

            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaBoletoEmissao.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state),
                    })
                    .then(this.oUtil.obterJsonResposta)
                    .then((oJsonDados) => {
                        this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarRetornoBoleto, true);
                    })
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }

    tratarRetornoBoleto(oDados) {
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados);
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);        
    }

    finalizar() {
        try {
            let url = this.oUtil.getURL('/emailclientes/enviar_com_anexos/');
            
            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaBoletoEmissao.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state),
                    })
                    .then(this.oUtil.obterJsonResposta)
                    .then((oJsonDados) => {
                        this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarRetornoEmail);
                    })
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }

    tratarRetornoEmail() {
        this.oDadosControleApp.processando_requisicao = false;
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoFinalizar = () => <Button title="Finalizar" onPress={this.finalizar}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoFinalizar } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Boleto' nomeTela='Visualização' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
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
            <View style={{
                flex: 1,
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginTop: 25,
            }}>
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath)=>{
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                    }}
                    onError={(error)=>{
                        if(source.uri) {
                            this.oUtil.obterJsonResposta(error);
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