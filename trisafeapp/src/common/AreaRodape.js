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
import Util from './Util';

export default class AreaRodape extends Component {

    constructor(props, value) {
        super(props);

        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
        }
    }
            
    render() {
        if(!this.props.semElementos) {
            return (
                <View style={styles.areaRodape}>
                    <AreaBarraEstado mensagem={this.oDadosInstrucao.texto_instrucao}/>
                    <ButtonGroup
                        buttons={this.props.botoes}
                        buttonStyle={ {alignItems: 'stretch'} }
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.areaRodape}>
                </View>
            );
        }
    }
}
AreaRodape.contextType = ContextoApp;