'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    View,
} from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import AreaBarraEstado from './AreaBarraEstado';
import { ContextoApp } from '../contexts/ContextoApp';
import { styles } from './Estilos';
import { inicializarContextoComum } from './Configuracao';

export default class AreaRodape extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this);
    }
    
    render() {
        let semElementos = !this.oDadosInstrucao.texto_instrucao && !this.props.botoes;
        let botoes = <View></View>;    

        if(this.props.botoes && this.props.botoes.length > 0) {
                                
            botoes = <ButtonGroup
                buttons={this.props.botoes}
                buttonStyle={ {alignItems: 'stretch'} }
            />;
        }

        if(semElementos) {
            return (
                <View style={styles.areaRodape}>
                </View>
            );
        } else {
            return (
                <View style={styles.areaRodape}>
                    <AreaBarraEstado mensagem={this.oDadosInstrucao.texto_instrucao}/>
                    {botoes}
                </View>
            );
        }
    }
}
AreaRodape.contextType = ContextoApp;