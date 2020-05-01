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

export default class Cabecalho extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let caminhoImagem = '../images/tri-logo-01.png';
        return (
            <View style={styles.areaCabecalho}>
                <Icon style={{marginLeft: 15, marginRight:15}} name="bars" size={30} color="#022C18" onPress={this.voltar}/>
                <Image style={{ width: 130, height:75, marginLeft: 20, marginRight:10}} source={require(caminhoImagem)} />
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