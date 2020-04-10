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
import Util from '../common/Util';
import { ThemeProvider, Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import AreaBotoes from '../common/AreaBotoes';
import GerenciadorDadosApp from './../common/GerenciadorDadosApp';

export default class TelaContratoAceite extends Component {
	
    constructor(props) {
        super(props);
        
        this.voltar = this.voltar.bind(this);
        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterArquivoContrato = this.obterArquivoContrato.bind(this);
    
        oUtil = new Util();
        oGerenciadorDadosApp = new GerenciadorDadosApp(this);
        oDadosApp = oGerenciadorDadosApp.getDadosApp();
        oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();

        this.state = oGerenciadorDadosApp.getDadosAppGeral();

        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(oGerenciadorDadosApp.temDados()) {
            this.obterArquivoContrato();
        }
    }

    obterArquivoContrato() {
        oDadosApp.contrato.url_pdf = oUtil.getURL('/contratos/obter_arquivo_contrato/');
    }

    contratar() {
        try {
            let url = oUtil.getURL('/contratos/aceitar/');
            
            oDadosControleApp.processando_requisicao = true;
            oGerenciadorDadosApp.atualizarEstadoTela(this);

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
                        oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetorno);
                    })
        } catch (exc) {
            Alert.alert(exc);
        }
    }

    tratarDadosRetorno(oDados) {
        oDadosControleApp.processando_requisicao = false;

        oGerenciadorDadosApp.atribuirDados('contrato', oDados);
        oGerenciadorDadosApp.atualizarEstadoTela(this);
    }

    voltar() {
        oGerenciadorDadosApp.voltar();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoContratar = () => <Button title="Contratar" onPress={this.contratar} loading={oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoContratar } ];
        
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
        let oDadosContrato = oDadosApp.contrato;

        const source = { 'uri': oDadosContrato.url_pdf,
                          method: 'POST',
                          headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                              'dados_app' : oDadosApp,
                          })
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