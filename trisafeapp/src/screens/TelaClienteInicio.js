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
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Cabecalho from '../common/CabecalhoTela';
import AreaRodape from '../common/AreaRodape';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';

export default class TelaClienteInicio extends Component {
    
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaClienteInicio.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util();
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.obterCliente = this.obterCliente.bind(this);
        this.tratarDadosCliente = this.tratarDadosCliente.bind(this);
        this.irParaTestesRapidos = this.irParaTestesRapidos.bind(this);

        this.oRegistradorLog.registrar('TelaClienteInicio.constructor() => Finalizou.');
    }

    obterCliente() {
        try {
            let metodoHTTP = '/clientes/obter/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoHTTP, oDadosParametros, this.tratarDadosCliente, true);

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
        this.oNavegacao.navigate('Testes', this.state);
    }

    botaoIniciar = () => <Button title="Iniciar" onPress={this.obterCliente} loading={this.oDadosControleApp.processando_requisicao}></Button>;
    botaoTestesRapidos = () => <Button title="Testes Rápidos" onPress={this.irParaTestesRapidos} ></Button>;

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

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;
        
        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input placeholder="Informe seu E-Mail" label="E-Mail" value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.setState(this.props)}}></Input>
                            <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props)}}></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}