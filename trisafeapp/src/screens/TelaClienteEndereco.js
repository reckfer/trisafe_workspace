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
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Util from './../common/Util';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaBotoes from './../common/AreaBotoes';
import { ContextoApp } from '../contexts/ContextoApp';

export default class TelaClienteEndereco extends Component {
	
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaClienteEndereco.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);

        this.oRegistradorLog.registrar('TelaClienteEndereco.constructor() => Finalizou.');
    }

    avancar() {
        // const { navigation } = this.props;
        
        // if(this.validarDadosPessoais()) {
            this.oGerenciadorContextoApp.setTelaAnterior(this);
            this.oNavegacao.navigate('Confirmação dos dados', this.state);
        // }
    }

    voltar() {
        console.log('TelaClienteEndereco.voltar() => Voltando...');
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oGerenciadorContextoApp.getTelaAnterior());
        this.oNavegacao.goBack();
    }

    render() {
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Avançar" onPress={this.avancar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Meus dados' nomeTela='Endereço' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
            </View>
        );
    }
}
TelaClienteEndereco.contextType = ContextoApp;

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
                        <Input placeholder="Informe sua Rua" label="Rua" value={oDadosCliente.rua} onChangeText={(valor) => { oDadosCliente.rua = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu Número" label="Número" value={oDadosCliente.numero} onChangeText={(valor) => { oDadosCliente.numero = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu Complemento" label="Complemento" value={oDadosCliente.complemento} onChangeText={(valor) => { oDadosCliente.complemento = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu Bairro" label="Bairro" value={oDadosCliente.bairro} onChangeText={(valor) => { oDadosCliente.bairro = valor; this.setState(this.props)}}></Input>                
                        <Input placeholder="Informe seu Cep" label="Cep" value={oDadosCliente.cep} onChangeText={(valor) => { oDadosCliente.cep = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe sua Cidade" label="Cidade" value={oDadosCliente.cidade} onChangeText={(valor) => { oDadosCliente.cidade = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu Estado" label="Estado" value={oDadosCliente.uf} onChangeText={(valor) => { oDadosCliente.uf = valor; this.setState(this.props)}}></Input>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}