/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button, ButtonGroup } from 'react-native-elements';
import { clonarObjeto } from "../common/Util";
import {
    
    View,
    // PermissionsAndroid
} from 'react-native';
import Util from '../common/Util';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import Icon from 'react-native-vector-icons/FontAwesome';
import Configuracao from '../common/Configuracao';

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
            this.oRegistradorLog.registrar('TelaMenuInicio.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.irParaMeusDados = this.irParaMeusDados.bind(this);
        this.irParaMeusVeiculos = this.irParaMeusVeiculos.bind(this);
    }

    componentDidMount() {
        this.oRegistradorLog.registrar('[trisafeapp] componentDidMount() ++++++++++++ iniciou ++++++++++++');
        
        this.inicializar();
        
        console.log('[trisafeapp] componentDidMount() ------------ terminou ------------');
    }
    
    inicializar() {
        this.oConfiguracao.configurarCredenciais();
    }
    
    montarStatusConfig() {

        if(this.oConfiguracao.temIntervaloDefinido()) {
            return(
                <View style={{marginTop:1}}>
                    <Text>Aguarde a próxima notificação</Text>
                </View>
            );
        } else {
            return(
                <View style={{marginTop:1}}>
                    <Text>Configure os intervalos</Text>
                </View>
            );
        }
    }

    irParaMeusDados() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    irParaMeusVeiculos() {
        this.oGerenciadorContextoApp.setTelaAnterior(this);
        this.oNavegacao.navigate('Veiculo Inicio', this.state);
    }

    render() {
        let botoesTela = [ 
            <Button title="Meus dados" key={1} onPress={this.irParaMeusDados} buttonStyle={{margin:10, padding: 10}} icon={<Icon name="user" color="#022F18" size={20} style={{margin:10}} />}></Button>, 
            <Button title="Meus Veículos" key={2} onPress={this.irParaMeusVeiculos} buttonStyle={{margin:10, padding:10}} icon={<Icon name="car" color="#022F18" size={20} style={{margin:10}} />}></Button>
         ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Menu' navigation={this.oNavegacao}/>
                <AreaDados botoes={botoesTela}/>
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
        //estiloAreaDadosCliente.margin = 30;

        return (
            <View style={estiloAreaDadosCliente} >
                {this.props.botoes}
            </View>
        );
    }
}