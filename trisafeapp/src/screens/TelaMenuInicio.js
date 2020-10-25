'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import {
    View
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import { styles } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import Icon from 'react-native-vector-icons/FontAwesome';
import AreaRodape from '../common/AreaRodape';
import Orientation from 'react-native-orientation';
import { inicializarContextoComum } from '../common/Configuracao';
import MensagemModal from '../common/MensagemModal';

const NOME_COMPONENTE = 'TelaMenuInicio';
const INSTRUCAO_INICIAL = 'Bem vindo a Trisafe.';

export default class TelaMenuInicio extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.irParaMeusDados = this.irParaMeusDados.bind(this);
        this.irParaMeusVeiculos = this.irParaMeusVeiculos.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.definirDadosPadraoTela = this.definirDadosPadraoTela.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        this.registrarEventoFoco();

        this.inicializar();
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    
    inicializar() {
        let nomeFuncao = 'inicializar';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        this.oRegistradorLog.registrar(`Dados do dispositivo: ${JSON.stringify(this.oDadosDispositivo)}`);

        this.oConfiguracao.configurarRotinaDeSegundoPlano();
        this.oConfiguracao.autenticarCliente();
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    registrarEventoFoco() {
        this.oNavegacao.addListener('focus', this.definirDadosPadraoTela);
    }
    
    definirDadosPadraoTela() {
        let nomeFuncao = 'definirDadosPadraoTela';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        Orientation.unlockAllOrientations();

        this.oDadosControleApp.cadastrando_cliente = false;
        this.oDadosControleApp.cadastrando_veiculo = false;
        this.oDadosInstrucao.texto_instrucao = INSTRUCAO_INICIAL;

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    irParaMeusDados() {
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    irParaMeusVeiculos() {
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
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
                <MensagemModal />
            </View>
        )
    }
}

TelaMenuInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    render() {
        return (
            <View style={styles.areaDadosCliente} >
                {this.props.botoes}
            </View>
        );
    }
}