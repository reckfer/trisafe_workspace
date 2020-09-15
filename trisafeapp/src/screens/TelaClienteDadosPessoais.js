'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    ScrollView,
    Alert,
    View,
} from 'react-native';
import ComunicacaoHTTP from './../common/ComunicacaoHTTP';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaRodape from './../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Orientation from 'react-native-orientation';

export default class TelaClienteDadosPessoais extends Component {
	
    constructor(props, value) {
        super(props);
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaClienteDadosPessoais.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.texto_instrucao = 'Informe seus dados pessoais.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;

        this.voltar = this.voltar.bind(this);
        this.avancar = this.avancar.bind(this);

        this.oRegistradorLog.registrar('TelaClienteDadosPessoais.constructor() => Finalizou.');
    }

    componentDidMount() {
        
        Orientation.unlockAllOrientations();
    }
    
    avancar() {

        this.oNavegacao.navigate('Endereco', this.state);
    }

    voltar() {
        this.oNavegacao.goBack();
    }
    
    render() { 
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Avançar" onPress={this.avancar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela}/>
            </View>
        );
    }
}
TelaClienteDadosPessoais.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;
        
        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView >
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input placeholder="Informe seu Nome Completo" label="Nome Completo" value={oDadosCliente.nome} onChangeText={(valor) => { oDadosCliente.nome = valor; this.setState(this.props);}}></Input>
                            <Input placeholder="Informe seu E-Mail" label="E-mail" value={oDadosCliente.email} onChangeText={(valor) => {oDadosCliente.email = valor; this.setState(this.props);}}></Input>
                            <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props);}}></Input>
                            <Input placeholder="Informe seu Telefone" label="Telefone" value={oDadosCliente.telefone} onChangeText={(valor) => { oDadosCliente.telefone = valor; this.setState(this.props);}}></Input>
                            <Input placeholder="Informe seu Nome de Usuário" label="Nome de Usuário" value={oDadosCliente.nome_usuario} onChangeText={(valor) => { oDadosCliente.nome_usuario = valor; this.setState(this.props);}}></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}