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
    Text,
    View,
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';

const NOME_COMPONENTE = 'TelaVeiculoInicio';
const INSTRUCAO_INICIAL = '';

export default class TelaVeiculoInicio extends Component {
    
    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.irParaMeusDados = this.irParaMeusDados.bind(this);
        this.irParaMeusVeiculos = this.irParaMeusVeiculos.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    
    irParaMeusDados() {
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    irParaMeusVeiculos() {
        this.oNavegacao.navigate('Veiculos', this.state);
    }

    botaoIrParaMeusDados = () => <Button title="Meus dados" onPress={this.irParaMeusDados}></Button>;
    botaoIrParaMeusVeiculos = () => <Button title="Meus Veículos" onPress={this.irParaMeusVeiculos} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoIrParaMeusDados }, { element: this.botaoIrParaMeusVeiculos} ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Meus veículos' nomeTela='Início' navigation={this.oNavegacao} />
                <AreaDados botoes={botoesTela} />
            </View>
        )
    }
}

TelaVeiculoInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
    }

    render() {
        
        return (
            <ScrollView>
                <ThemeProvider theme={theme}>
                    <View >
                        <Text>A ser desenvolvido...</Text>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}