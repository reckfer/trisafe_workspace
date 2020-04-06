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
import Util from './../common/Util';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaBotoes from './../common/AreaBotoes';
import GerenciadorDadosApp from './../common/GerenciadorDadosApp';

export default class TelaClienteDadosPessoais extends Component {
	
    constructor(props) {
        super(props);
        
        this.voltar = this.voltar.bind(this);
        this.avancar = this.avancar.bind(this);
        
        oUtil = new Util();
        oGerenciadorDadosApp = new GerenciadorDadosApp(this);
        oDadosApp = oGerenciadorDadosApp.getDadosApp();
        oDadosControleApp = oGerenciadorDadosApp.getDadosControleApp();

        this.state = oGerenciadorDadosApp.getDadosAppGeral();
    }

    tratarRetornoJson(oJsonResposta) {
    
        Alert.alert(oJsonResposta.mensagem);
        if(oJsonResposta && !oJsonResposta.ok) {
            
            return null;
        }
        return oJsonResposta;
    }

    avancar() {
        
        // if(this.validarDadosPessoais()) {
            // this.state.dados_app.emCadastro = false;
            oGerenciadorDadosApp.irPara('Endereço', this.state);
        // }
    }

    voltar() {
        
        oGerenciadorDadosApp.voltar();
    }
    
    render() { 
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Avançar" onPress={this.avancar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar } ];

        // if(!this.state.emCadastro) {
        //     // Obtem os dados vindos da primeira tela.
        //     oUtil.lerDadosNavegacao(dadosCliente, navigation);
        // }
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' nomeTela='Meus dados' />
                <AreaDados dadosApp={oDadosApp}/>
                <AreaBotoes botoes={botoesTela}/>
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
        let oDadosCliente = oDadosApp.cliente;

        return (
            <ScrollView>
                <ThemeProvider theme={theme}>
                    <View style={styles.areaDadosCliente}>
                        <Input placeholder="Informe seu Nome Completo" label="Nome Completo" value={oDadosCliente.nome} onChangeText={(valor) => { oDadosCliente.nome = valor; this.setState(this.props);}}></Input>
                        <Input placeholder="Informe seu E-Mail" label="E-mail" value={oDadosCliente.email} onChangeText={(valor) => {oDadosCliente.email = valor; this.setState(this.props);}}></Input>
                        <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props);}}></Input>
                        <Input placeholder="Informe seu Telefone" label="Telefone" value={oDadosCliente.telefone} onChangeText={(valor) => { oDadosCliente.telefone = valor; this.setState(this.props);}}></Input>
                        <Input placeholder="Informe seu Nome de Usuário" label="Nome de Usuário" value={oDadosCliente.nome_usuario} onChangeText={(valor) => { oDadosCliente.nome_usuario = valor; this.setState(this.props);}}></Input>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}