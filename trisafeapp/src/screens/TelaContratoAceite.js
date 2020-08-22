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
import AreaRodape from '../common/AreaRodape';
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
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);

            let dadosParametros = JSON.stringify(this.state);

            this.oRegistradorLog.registrar(`TelaContratoAceite.contratar => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, this.oUtil.getParametrosHTTPS(dadosParametros))
                    .then(this.oUtil.obterJsonResposta)
                    .then((oJsonDados) => {
                        this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetorno);
                    });
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oDadosControleApp.processando_requisicao = false;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);

        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados);

        if(oEstado.ok) {
            this.oGerenciadorContextoApp.setTelaAnterior(this);
            this.oNavegacao.navigate('Boleto', this.state);
        }
    }

    voltar() {
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oGerenciadorContextoApp.getTelaAnterior());
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
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaContratoAceite.constructor() => Iniciou.');

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.excluirArquivoContrato = this.excluirArquivoContrato.bind(this);
    }

    excluirArquivoContrato() {
        try {
            
            let url = this.oUtil.getURL('/contratos/excluir_arquivo_contrato/');
            
            let dadosParametros = JSON.stringify(this.state);
            
            this.oRegistradorLog.registrar(`AreaDados.excluirArquivoContrato => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, this.oUtil.getParametrosHTTPS(dadosParametros))
                    .then(this.oUtil.obterJsonResposta)
                    .then((oJsonDados) => {
                        this.oUtil.tratarRetornoServidor(oJsonDados, null, true);
                    });
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
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
            <View style={styles.areaDadosCliente}>
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath)=>{
                        console.log('render() onLoadComplete', filePath);
                        this.excluirArquivoContrato();
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                        console.log('render() onPageChanged', page);
                    }}
                    onError={(error)=>{
                        console.log('render() onError', error);
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
AreaDados.contextType = ContextoApp;