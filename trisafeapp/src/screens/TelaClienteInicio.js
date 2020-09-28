'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import {
    ScrollView,
    Alert,
    View,
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import AreaRodape from '../common/AreaRodape';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaClienteInicio';
const INSTRUCAO_INICIAL = 'Informe seu CPF ou e-mail para iniciar.';

export default class TelaClienteInicio extends Component {
    
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.obterCliente = this.obterCliente.bind(this);
        this.tratarDadosCliente = this.tratarDadosCliente.bind(this);
        this.irParaTestesRapidos = this.irParaTestesRapidos.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
    }
    
    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        Orientation.unlockAllOrientations();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    componentWillUnmount() {        
        this.registrarEventoFoco();
    }

    registrarEventoFoco() {
        this.oNavegacao.addListener('focus', () => {
            Orientation.unlockAllOrientations();
        });
    }

    obterCliente() {
        try {
            let metodoURI = '/clientes/obter/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosCliente, true);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosCliente(oDados, oEstado) {
        let irPara = true;
        
        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            this.oDadosControleApp.novo_cadastro = true;
            Alert.alert('Trisafe', 'Informe seus dados para realizar o cadastro.');
        } else {
            if(oEstado.ok){
                this.oDadosControleApp.novo_cadastro = false;
            } else {
                irPara = false;
            }

            if (oEstado.mensagem && oEstado.mensagem.trim()) {
                Alert.alert('Trisafe', oEstado.mensagem);
            } else {
                Alert.alert('Trisafe', 'Atualize seus dados cadastrais.');
            }
        }
        this.oGerenciadorContextoApp.atribuirDados('cliente', oDados, this);

        if(irPara) {
            this.oNavegacao.navigate('Dados pessoais', this.state);
        }
    }

    irParaTestesRapidos() {
        this.oNavegacao.navigate('Fluxo Modais', { screen: 'Testes Cadastro' });
    }

    botaoIniciar = () => <Button title="Iniciar" onPress={this.obterCliente} loading={this.oDadosControleApp.processando_requisicao}></Button>;
    botaoTestesRapidos = () => <Button title="Testes Cadastro" onPress={this.irParaTestesRapidos} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoIniciar }, { element: this.botaoTestesRapidos} ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        )
    }
}

TelaClienteInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;
        
        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props)}}></Input>
                            <Input placeholder="Informe seu E-Mail" label="E-Mail" value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.setState(this.props)}}></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}