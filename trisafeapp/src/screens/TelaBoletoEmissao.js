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
import GerenciadorDadosApp from './../common/GerenciadorDadosApp';

export default class TelaBoletoEmissao extends Component {
	
        constructor(props) {
            super(props);
            
            this.voltar = this.voltar.bind(this);
            this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
            this.obterBoleto = this.obterBoleto.bind(this);
            this.tratarRetornoBoleto = this.tratarRetornoBoleto.bind(this);
            this.finalizar = this.finalizar.bind(this);
            this.tratarRetornoEmail = this.tratarRetornoEmail.bind(this);
        
            oUtil = new Util();
            oGerenciadorDadosApp = new GerenciadorDadosApp(this);
            oDadosApp = oGerenciadorDadosApp.getDadosApp();
            oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();
    
            this.state = oGerenciadorDadosApp.getDadosAppGeral();
    
            this.inicializarDadosTela();
        }
    
        inicializarDadosTela() {
    
            if(oGerenciadorDadosApp.temDados()) {
                this.obterBoleto();
            }
        }

        obterBoleto() {
            try {
                let url = oUtil.getURL('/boletogerencianets/obter/');
    
                fetch(url, {
                        method: 'POST',
                        headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.state)
                      })
                      .then(oUtil.obterJsonResposta)
                      .then((oJsonDados) => {
                          oUtil.tratarRetornoServidor(oJsonDados, this.tratarRetornoBoleto);
                      })
            } catch (exc) {
                Alert.alert(exc);
            }
        }
    
        tratarRetornoBoleto(oDados) {
            oGerenciadorDadosApp.atribuirDados('boleto', oDados);
            oGerenciadorDadosApp.atualizarEstadoTela(this);
        }

        finalizar() {
            try {
                let url = oUtil.getURL('/emailclientes/enviar_com_anexos/');
    
                fetch(url, {
                        method: 'POST',
                        headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.state)
                      })
                      .then(oUtil.obterJsonResposta)
                      .then((oJsonDados) => {
                          oUtil.tratarRetornoServidor(oJsonDados, this.tratarRetornoEmail);
                      })
            } catch (exc) {
                Alert.alert(exc);
            }
        }

        tratarRetornoEmail() {
            oDadosControleApp.processando_requisicao = false;
            oGerenciadorDadosApp.irPara('Cadastro', this.state);
        }
    
        voltar() {
            oGerenciadorDadosApp.voltar();
        }
    
        botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
        botaoFinalizar = () => <Button title="Finalizar" onPress={this.finalizar}></Button>;
    
        render() {
    
            let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoFinalizar } ];
            
            return (
                <View style={styles.areaCliente}>
                    <Cabecalho titulo='Boleto' nomeTela='Emissão' />
                    <AreaDados dadosApp={oDadosApp}/>
                    <AreaBotoes botoes={botoesTela} />
                </View>
            );
        }
    }
    
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
                            console.log('number of pages: ' + numberOfPages);
                        }}
                        onPageChanged={(page,numberOfPages)=>{
                            console.log('current page: ' + page);
                        }}
                        onError={(error)=>{
                            console.log(error);
                            if(source.uri) {
                                oUtil.obterJsonResposta(error);
                            }
                        }}
                        onPressLink={(uri)=>{
                            console.log('Link presse: ' + uri);
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