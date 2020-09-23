'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import { clonarObjeto } from '../contexts/DadosAppGeral';
import {
    View,
    Text, BackHandler, Alert
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import Icon from 'react-native-vector-icons/FontAwesome';
import Configuracao from '../common/Configuracao';
import AreaRodape from '../common/AreaRodape';
import Orientation from 'react-native-orientation';
import { StackActions } from '@react-navigation/native';

export default class TelaMenuInicio extends Component {
    
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaMenuInicio.constructor() ++++++++++++ iniciou ++++++++++++');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this);
            
            this.texto_instrucao = 'Bem vindo a Trisafe.';
            this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.irParaMeusDados = this.irParaMeusDados.bind(this);
        this.irParaMeusVeiculos = this.irParaMeusVeiculos.bind(this);
        // this.tratarVoltarPeloDispositivo = this.tratarVoltarPeloDispositivo.bind(this);
        
        this.oRegistradorLog.registrar('TelaMenuInicio.constructor() ------------ terminou ------------');
    }

    componentDidMount() {

        Orientation.unlockAllOrientations();

        this.oRegistradorLog.registrar('TelaMenuInicio.componentDidMount() ++++++++++++ iniciou ++++++++++++');
        
        this.inicializar();
        
        this.oRegistradorLog.registrar('TelaMenuInicio.componentDidMount() ------------ terminou ------------');
    }
    
    inicializar() {
        this.oConfiguracao.autenticarCliente();
    }
    
    irParaMeusDados() {
        this.oNavegacao.navigate('Fluxo Cadastro Cliente', this.state);
    }

    irParaMeusVeiculos() {
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        // this.oNavegacao.navigate('Veículo Inicio', this.state);
    }

    render() {
        
        let botoesTela = [ 
            <Button title="Meus dados" key={1} onPress={this.irParaMeusDados} buttonStyle={{margin:10, padding: 10}} icon={<Icon name="user" color="#022F18" size={20} style={{margin:10}} />}></Button>, 
            <Button title="Meus Veículos" key={2} onPress={this.irParaMeusVeiculos} buttonStyle={{margin:10, padding:10}} icon={<Icon name="car" color="#022F18" size={20} style={{margin:10}} />}></Button>
        ];
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='' navigation={this.oNavegacao}/>
                <AreaDados botoes={botoesTela}/>
                <AreaRodape />
            </View>
        )
    }
}

TelaMenuInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let estiloAreaDadosCliente = clonarObjeto(styles.areaDadosCliente);

        return (
            <View style={estiloAreaDadosCliente} >
                {this.props.botoes}
            </View>
        );
    }
}