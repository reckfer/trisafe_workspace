'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { styles } from './Estilos';
import {
    View,
    Text,
} from 'react-native';

export default class AreaBarraEstado extends Component {

    constructor(props) {
        super(props);
    }
            
    render() {
        return (
            <View style={styles.subAreaBarraEstado}>
                <Text>{this.props.mensagem}</Text>
            </View>
        );
    }
}