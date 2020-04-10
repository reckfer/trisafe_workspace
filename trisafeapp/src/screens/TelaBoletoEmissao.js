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
            this.gerarBoleto = this.gerarBoleto.bind(this);
            this.tratarRetornoBoleto = this.tratarRetornoBoleto.bind(this);
        
            oUtil = new Util();
            oGerenciadorDadosApp = new GerenciadorDadosApp(this);
            oDadosApp = oGerenciadorDadosApp.getDadosApp();
            oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();
    
            this.state = oGerenciadorDadosApp.getDadosAppGeral();
    
            this.inicializarDadosTela();
        }
    
        inicializarDadosTela() {
    
            if(oGerenciadorDadosApp.temDados()) {
                this.gerarBoleto();
            }
        }

        gerarBoleto() {
            try {
                let url = oUtil.getURL('/boletogerencianets/gerar_boleto/');
    
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
    
        voltar() {
            oGerenciadorDadosApp.voltar();
        }
    
        botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
        botaoConfirmar = () => <Button title="Confirmar" ></Button>;
    
        render() {
    
            let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoConfirmar } ];
            
            return (
                <View style={styles.areaCliente}>
                    <Cabecalho titulo='Contrato' nomeTela='Confirmação' />
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
    
            const source = { 'uri': oDadosBoleto.url_pdf }
    
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
                            oUtil.obterJsonResposta(error);
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