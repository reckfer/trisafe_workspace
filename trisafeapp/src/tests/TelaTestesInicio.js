/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button, Card} from 'react-native-elements';
import {
    ScrollView,
    Alert,
    View
} from 'react-native';
import Util from '../common/Util';
import Cabecalho from '../common/CabecalhoTela';
import AreaBotoes from '../common/AreaBotoes';
import { styles, theme } from '../common/Estilos';
import UtilTests from './UtilTests';
import { ContextoApp } from '../contexts/ContextoApp';

export default class TelaTestesInicio extends Component {

    constructor(props, value) {
        super(props);
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaTestesInicio.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;            
        }
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        this.objUtilTests = new UtilTests();

        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.irParaTesteCadastroIter = this.irParaTesteCadastroIter.bind(this);
        this.irParaTesteBoletoGerenciaNet = this.irParaTesteBoletoGerenciaNet.bind(this);        
        this.irParaTesteGeraContratoPDF = this.irParaTesteGeraContratoPDF.bind(this);
        this.irParaTesteContratoPDF = this.irParaTesteContratoPDF.bind(this);
        this.obterUltimoCliente = this.obterUltimoCliente.bind(this);        
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.obterContratoPorCliente = this.obterContratoPorCliente.bind(this);
        this.tratarDadosRetornoContrato = this.tratarDadosRetornoContrato.bind(this);
        this.gerarDadosTestes = this.gerarDadosTestes.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.oRegistradorLog.registrar('TelaTestesInicio.constructor() => Finalizou.');
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(!this.oGerenciadorContextoApp.temDados()) {
            this.obterUltimoCliente();
        }
    }

    irParaTesteCadastroIter() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    irParaTesteBoletoGerenciaNet() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Boleto', this.state);
    }

    irParaTesteGeraContratoPDF() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Produtos', this.state);
    }

    irParaTesteContratoPDF() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Contrato', this.state);
    }

    obterUltimoCliente() {
        try {
            let url = this.oUtil.getURL('/clientes/obter_ultimo/');
            
            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaTestesInicio.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state)
                  })
                  .then(this.oUtil.obterJsonResposta)
                  .then((oJsonDados) => {
                      this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetorno);
                  })
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }

    tratarDadosRetorno(oDados) {

        this.oGerenciadorContextoApp.atribuirDados('cliente', oDados);
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        this.obterContratoPorCliente();
    }

    obterContratoPorCliente() {
        try {
            let url = this.oUtil.getURL('/contratos/obter_por_cliente/');
            
            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaTestesInicio.obterContratoPorCliente => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

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
                      this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetornoContrato);
                  });
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }
    
    tratarDadosRetornoContrato(oDados) {

        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    gerarDadosTestes() {
        let oDadosCliente = this.oDadosApp.cliente;

        let numAleatorio = Math.random();
        let usuario = numAleatorio.toString(36).slice(6);

        oDadosCliente.nome = 'Fernando Reck ' + usuario;
        oDadosCliente.cpf = this.objUtilTests.gerarCPF();
        oDadosCliente.email = usuario + '@emailtestes.com.br';
        oDadosCliente.nome_usuario = usuario;
        oDadosCliente.telefone = '519' + numAleatorio.toString().slice(10);
        oDadosCliente.rua = 'Rua do Relógio';
        oDadosCliente.numero = numAleatorio.toString().slice(15);
        oDadosCliente.cidade = 'Porto Alegre';
        oDadosCliente.uf = 'RS';
        oDadosCliente.complemento = 'Ap. 4' + numAleatorio.toString(16);
        oDadosCliente.bairro = 'Bela Vista';
        oDadosCliente.cep = numAleatorio.toString().slice(10);

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    
    render() {
        let botoesTela = [ 
            { element: this.botaoVoltar }, 
        ];
        let funcoes = {
            'irParaTesteCadastroIter': this.irParaTesteCadastroIter,
            'irParaTesteGeraContratoPDF' : this.irParaTesteGeraContratoPDF,
            'irParaTesteBoletoGerenciaNet': this.irParaTesteBoletoGerenciaNet,
            'irParaTesteContratoPDF': this.irParaTesteContratoPDF,
            'gerarDadosTestes': this.gerarDadosTestes,
        }
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Testes' nomeTela='Início' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp} funcoes={funcoes} />
                <AreaBotoes botoes={botoesTela} />
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    atualizarDados(oDadosCliente) {
        let oDadosNavegacao = this.props.dados_app;
        oDadosNavegacao.cliente = oDadosCliente;
        
        this.setState(oDadosNavegacao);
    }

    render() {
        let oDadosCliente = this.props.dadosApp.cliente;
        let oFuncoes = this.props.funcoes;

        return (
            <View style={{flex: 1, flexDirection: 'column', }}>
                <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Button title="Cadastro Iter" onPress={oFuncoes.irParaTesteCadastroIter} ></Button>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Button title="Gera Contrato" onPress={oFuncoes.irParaTesteGeraContratoPDF}></Button>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Button title="Contrato PDF" onPress={oFuncoes.irParaTesteContratoPDF}></Button>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Button title="Gerar Dados Teste" onPress={oFuncoes.gerarDadosTestes}></Button>
                </View>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                    <ScrollView>
                        <ThemeProvider theme={theme}>                    
                            <View>
                                <Card title='Últimos dados de teste'>
                                    <View style={{flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                                        <Input label="Nome Completo" style={styles.Input} value={oDadosCliente.nome} onChangeText={(valor) => { oDadosCliente.nome = valor; this.atualizarDados(oDadosCliente) }}></Input>                
                                        <Input label="E-mail" style={styles.Input} value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.atualizarDados(oDadosCliente) }}></Input>
                                        <Input label="CPF" style={styles.Input} value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.atualizarDados(oDadosCliente) }}></Input>
                                    </View>
                                </Card>
                            </View>
                        </ThemeProvider>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
TelaTestesInicio.contextType = ContextoApp;