'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button, Card, ButtonGroup} from 'react-native-elements';
import {
    ScrollView,
    Alert,
    View
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Cabecalho from '../common/CabecalhoTela';
import AreaRodape from '../common/AreaRodape';
import { styles, theme } from '../common/Estilos';
import UtilTests from './UtilTests';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';

export default class TelaModalTestesCadastro extends Component {

    constructor(props, value) {
        super(props);
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaModalTestesCadastro.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
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
        this.irParaTesteContratoPDF = this.irParaTesteContratoPDF.bind(this);
        this.irParaTesteFotoCNH = this.irParaTesteFotoCNH.bind(this);
        this.irParaTesteFotoDocVeiculo = this.irParaTesteFotoDocVeiculo.bind(this);
        this.obterUltimoCliente = this.obterUltimoCliente.bind(this);        
        this.obterContratoPorCliente = this.obterContratoPorCliente.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.tratarDadosRetornoContrato = this.tratarDadosRetornoContrato.bind(this);
        this.gerarDadosTestes = this.gerarDadosTestes.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'Selecione a opção de teste.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;

        this.oRegistradorLog.registrar('TelaModalTestesCadastro.constructor() => Finalizou.');
    }

    componentDidMount() {
        this.inicializarDadosTela();
    }

    inicializarDadosTela() {

        if(!this.oGerenciadorContextoApp.temDados()) {
            this.obterUltimoCliente();
        }
    }

    irParaTesteCadastroIter() {
        this.oNavegacao.navigate('Cadastro Cliente', { screen: 'Cadastro' });

    }

    irParaTesteBoletoGerenciaNet() {
        this.oNavegacao.navigate('Cadastro Cliente', { screen: 'Boleto' });

    }

    irParaTesteContratoPDF() {
        this.oNavegacao.navigate('Cadastro Cliente', { screen: 'Contrato' });
    }

    irParaTesteFotoCNH() {
        this.oNavegacao.navigate('Cadastro Cliente', { screen: 'Foto CNH' });
    }

    irParaTesteFotoDocVeiculo() {
        //this.oNavegacao.navigate('Foto CNH', this.state);
    }

    obterUltimoCliente() {
        try {
            let metodoURI = '/clientes/obter_ultimo/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        this.oGerenciadorContextoApp.atribuirDados('cliente', oDados, this);
        
        this.obterContratoPorCliente();
    }

    obterContratoPorCliente() {

        try {
            let metodoURI = '/contratos/obter_por_cliente/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetornoContrato);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }
    
    tratarDadosRetornoContrato(oDados) {
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados, this);
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
    
    botaoCadastro = () => <Button title="Testar Cadastro" onPress={this.irParaTesteCadastroIter} ></Button>
    botaoGerarDados = () => <Button title="Gerar Dados Teste" onPress={this.gerarDadosTestes} ></Button>
    botaoContrato = () => <Button title="Testar Contrato" onPress={this.irParaTesteContratoPDF} ></Button>
    botaoBoleto = () => <Button title="Testar Boleto" onPress={this.irParaTesteBoletoGerenciaNet} ></Button>
    botaoFotoCNH = () => <Button title="Testar Foto CNH" onPress={this.irParaTesteFotoCNH} ></Button>
    botaoFotoDocVeiculo = () => <Button title="Testar Foto Doc" onPress={this.irParaTesteFotoDocVeiculo} ></Button>
    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    
    render() {
        let botoesTestes1 = [ 
            { element: this.botaoCadastro }, { element: this.botaoGerarDados } 
        ];
        let botoesTestes2 = [ 
            { element: this.botaoContrato }, { element: this.botaoBoleto } 
        ];
        let botoesTestes3 = [ 
            { element: this.botaoFotoCNH }, { element: this.botaoFotoDocVeiculo } 
        ];
        let botoesTela = [ 
            { element: this.botaoVoltar }, 
        ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Testes Cadastro' nomeTela='Início' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp} botoesTestes1={botoesTestes1} botoesTestes2={botoesTestes2} botoesTestes3={botoesTestes3}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props) {
        super(props);

        this.atualizarDados = this.atualizarDados.bind(this);
    }

    atualizarDados(oDadosCliente) {
        let oDadosNavegacao = this.props.dados_app;
        oDadosNavegacao.cliente = oDadosCliente;
        
        this.setState(oDadosNavegacao);
    }

    render() {
        let oDadosCliente = this.props.dadosApp.cliente;

        return (
            <View style={styles.areaDadosCliente}>
                <ButtonGroup
                    buttons={this.props.botoesTestes1}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes2}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
                <ButtonGroup
                    buttons={this.props.botoesTestes3}
                    buttonStyle={ {alignItems: 'stretch'} }
                />
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
        );
    }
}
TelaModalTestesCadastro.contextType = ContextoApp;