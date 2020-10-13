'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ContextoApp } from '../contexts/ContextoApp';
//import { styles } from './Estilos';
import { inicializarContextoComum } from './Configuracao';

export default class MensagemModal extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this);

        this.montarBotoes = this.montarBotoes.bind(this);
        this.fechar = this.fechar.bind(this);
    }

    montarBotoes() {
        let oElementosBotoes = [];
        let oListaBotoes = this.oDadosControleApp.config_modal.botoes;
        let oConfigBotao;

        if(oListaBotoes && oListaBotoes.length > 0) {
        
            for(let i = 0; i < oListaBotoes.length; i++) {
        
                oConfigBotao = oListaBotoes[i];
                
                oElementosBotoes.push(
                    <TouchableHighlight key={i}
                      style={{ backgroundColor: "#2196F3" }}
                      onPress={() => {
                          if(oConfigBotao.funcao) {
                            oConfigBotao.funcao()
                          }
                          this.fechar();
                      }}
                    >
                        <Text style={styles.textStyle}>{oConfigBotao.texto}</Text>
                    </TouchableHighlight>
                );
            }
        }
        return (oElementosBotoes)
    }

    fechar() {
        this.oDadosControleApp.config_modal.exibir_modal = false;
        this.oGerenciadorContextoApp.atualiarEstadoTela();
    }

    render() {
        //this.oDadosControleApp.config_modal.exibir_modal = false;
        return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                presentationStyle='fullScreen'
                transparent={true}
                visible={this.oDadosControleApp.config_modal.exibir_modal}
                onRequestClose={() => {
                  Alert.alert("Modal has been closed.");
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{this.oDadosControleApp.config_modal.mensagem}</Text>                        
                    </View>
                    <View>
                        {this.montarBotoes()}
                    </View>
                </View>
            </Modal>
        </View>)
    }
}
MensagemModal.contextType = ContextoApp;

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    openButton: {
      backgroundColor: "#F194FF",
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    textStyle: {
      color: "black",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });