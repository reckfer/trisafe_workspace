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
import ComunicacaoHTTP from './ComunicacaoHTTP';

export default class AreaRodape extends Component {

    constructor(props, value) {
        super(props);

        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
        }
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