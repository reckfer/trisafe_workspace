/**
 * Componente de cabecalho padrão de uma tela.
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    Image
} from 'react-native';
import { styles } from './Estilos';

export default class Cabecalho extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let caminhoImagem = '../images/tri-logo-01.png';
        return (
            <View style={styles.areaCabecalho}>
                <Image source={require(caminhoImagem)} />
                <Titulo titulo={this.props.titulo} nomeTela={this.props.nomeTela} />
            </View>
        );
    }
}

export class Titulo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.areaTitulo}>
                <Text style={styles.textoTitulo}>{this.props.titulo}</Text>
                <Text style={styles.textoNomeTela}>{this.props.nomeTela}</Text>
            </View>
        );
    }
}