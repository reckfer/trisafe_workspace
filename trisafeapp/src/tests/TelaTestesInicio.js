/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button} from 'react-native-elements';
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
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.objUtilTests = new UtilTests();
            this.oUtil = new Util(this);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.irParaTesteCadastroIter = this.irParaTesteCadastroIter.bind(this);
        this.irParaTesteGeraContratoPDF = this.irParaTesteGeraContratoPDF.bind(this);
        this.irParaTesteBoletoGerenciaNet = this.irParaTesteBoletoGerenciaNet.bind(this);        
        this.irParaTesteContratoPDF = this.irParaTesteContratoPDF.bind(this);
        this.gerarDadosTestes = this.gerarDadosTestes.bind(this);
        this.obterUltimoCliente = this.obterUltimoCliente.bind(this);        
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.obterContratoPorCliente = this.obterContratoPorCliente.bind(this);
        this.tratarDadosRetornoContrato = this.tratarDadosRetornoContrato.bind(this);
        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.voltar = this.voltar.bind(this);
                
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(!this.oGerenciadorContextoApp.temDados()) {
            this.obterUltimoCliente();
        }
    }

    irParaTesteCadastroIter() {
        
        let oDados = this.gerarDadosTestes();

        this.oNavegacao.navigate('Cadastro', oDados);
    }

    irParaTesteBoletoGerenciaNet() {
        
        this.oNavegacao.navigate('Boleto', this.state);
    }

    irParaTesteGeraContratoPDF() {

        this.oNavegacao.navigate('Produtos', this.state);
    }

    irParaTesteContratoPDF() {
        
        this.oNavegacao.navigate('Contrato', this.state);
    }

    obterUltimoCliente() {
        try {
            let url = this.oUtil.getURL('/clientes/obter_ultimo/');
           
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
            Alert.alert(exc);
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
                      this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosRetornoContrato);
                  })
        } catch (exc) {
            Alert.alert(exc);
        }
    }
    
    tratarDadosRetornoContrato(oDados) {

        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    gerarDadosTestes() {
        let oDadosAppGeral = this.oGerenciadorContextoApp.dadosAppGeral;
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

        return oDadosAppGeral;
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
                <Cabecalho titulo='Testes' nomeTela='Início' />
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
            <ScrollView>
                <View style={{flex: 1, flexDirection: 'column', }}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                        <View style={{height:50}} >
                            <Button title="Cadastro Iter" onPress={oFuncoes.irParaTesteCadastroIter} ></Button>
                        </View>
                        <View style={{height:50}} >
                            <Button title="Gera Contrato" onPress={oFuncoes.irParaTesteGeraContratoPDF}></Button>
                        </View>                        
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                        <View style={{height:50}} >
                            <Button title="Boleto GerenciaNet" onPress={oFuncoes.irParaTesteBoletoGerenciaNet} ></Button>
                        </View>
                        <View style={{height:50}} >
                            <Button title="Menu" ></Button>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                        <View style={{height:50}} >
                            <Button title="Contrato PDF" onPress={oFuncoes.irParaTesteContratoPDF}></Button>
                        </View>                    
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
                        <View style={{flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                            <Input label="Nome Completo" style={styles.Input} value={oDadosCliente.nome} onChangeText={(valor) => { oDadosCliente.nome = valor; this.atualizarDados(oDadosCliente) }}></Input>                
                            <Input label="E-mail" style={styles.Input} value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.atualizarDados(oDadosCliente) }}></Input>
                            <Input label="CPF" style={styles.Input} value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.atualizarDados(oDadosCliente) }}></Input>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }
}
TelaTestesInicio.contextType = ContextoApp;