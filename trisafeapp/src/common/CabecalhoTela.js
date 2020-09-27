'use strict';
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
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from './Util';

export default class Cabecalho extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this);
    }

    render() {
        let caminhoImagem = '../images/tri-logo-01.png';

        return (
            <View style={styles.areaCabecalho}>
                <Icon style={{marginLeft: 10}} name="bars" size={30} color="#022C18" onPress={this.oNavegacao.openDrawer}/>
                <Image style={{width: 130, height:75, marginLeft: 80, marginRight:15}} source={require(caminhoImagem)} />
                <Titulo titulo={this.props.titulo} nomeTela={this.props.nomeTela} />
            </View>
        );
    }
}

Cabecalho.contextType = ContextoApp;

export class Titulo extends Component {
    constructor(props, contexto) {
        super();
    }

    render() {
        return (
            <View style={styles.subAreaTitulo}>
                <Text style={styles.textoTitulo}>{this.props.titulo}</Text>
            </View>
        );
    }
}