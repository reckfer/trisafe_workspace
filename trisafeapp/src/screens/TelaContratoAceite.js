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
import { Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import AreaBotoes from '../common/AreaBotoes';
import { ContextoApp } from '../contexts/ContextoApp';

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
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.oDadosControleApp.processando_requisicao = false;
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterArquivoContrato = this.obterArquivoContrato.bind(this);
        this.contratar = this.contratar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.voltar = this.voltar.bind(this);

        this.oRegistradorLog.registrar('TelaContratoAceite.constructor() => Finalizou.');
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(this.oGerenciadorContextoApp.temDados()) {
            this.obterArquivoContrato();
        }
    }

    obterArquivoContrato() {
        this.oDadosApp.contrato.url_pdf = this.oUtil.getURL('/contratos/obter_arquivo_contrato/');
    }

    contratar() {
        try {
            let url = this.oUtil.getURL('/contratos/aceitar/');
            
            this.oDadosControleApp.processando_requisicao = true;

            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaBoletoEmissao.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);

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
                        this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetorno);
                    })
        } catch (exc) {
            Alert.alert(exc);
        }
    }

    tratarDadosRetorno(oDados) {

        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados);

        this.oNavegacao.navigate('Boleto', this.state);
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
                <Cabecalho titulo='Contrato' nomeTela='Confirmação' />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
            </View>
        );
    }
}
TelaContratoAceite.contextType = ContextoApp;

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
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                    }}
                    onError={(error)=>{
                        this.oUtil.obterJsonResposta(error);
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