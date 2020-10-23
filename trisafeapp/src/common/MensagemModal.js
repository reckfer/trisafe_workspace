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
    Text,
    ActivityIndicator,
    TouchableHighlight
} from 'react-native';
import { ContextoApp } from '../contexts/ContextoApp';
import { clonarObjeto, DADOS_MENSAGEM_MODAL } from '../contexts/DadosAppGeral';
import { inicializarContextoComum } from './Configuracao';

export default class MensagemModal extends Component {

    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this);
        this.oGerenciadorContextoApp.componenteMensagemModal = this;
        this.oDadosControleApp.config_modal = clonarObjeto(DADOS_MENSAGEM_MODAL);

        this.montarBotoes = this.montarBotoes.bind(this);
        this.realizarAcaoBotao = this.realizarAcaoBotao.bind(this);
        this.fechar = this.fechar.bind(this);
    }

    montarBotoes() {
        let oElementosBotoes = [];
        let oListaBotoes = this.oDadosControleApp.config_modal.botoes;
        let oConfigBotao;

        if(this.oDadosControleApp.config_modal.exibir_modal && oListaBotoes && oListaBotoes.length > 0) {
        
            for(let i = 0; i < oListaBotoes.length; i++) {
        
                oConfigBotao = oListaBotoes[i];

                oElementosBotoes.push(
                    <TouchableHighlight key={i}
                      style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                      onPress={() => {
                        this.realizarAcaoBotao(oListaBotoes[i]);
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
        this.oDadosControleApp.config_modal = clonarObjeto(DADOS_MENSAGEM_MODAL);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    realizarAcaoBotao(oConfigBotao) {
      
        if(oConfigBotao.funcao) {
          oConfigBotao.funcao();
        }
        this.fechar();      
    }

    controlarIndicadorAtividade(indExibir) {
      if(indExibir) {
        return(<ActivityIndicator color='#2196F3' size='large' style={{marginBottom: 20}}/>)
      }
      return(<View></View>)
    }

    render() {
        let indExibirIndicador = false;
        let exibir = false;
        let mensagem = '';
        let margemHorizontal = 40;

        if(this.oDadosControleApp) {
          indExibirIndicador = !(this.oDadosControleApp.config_modal.botoes.length > 0);
          exibir = this.oDadosControleApp.config_modal.exibir_modal;
          mensagem = this.oDadosControleApp.config_modal.mensagem;
          if(this.oDadosControleApp.tela_na_horizontal) {
            margemHorizontal = 120;
          }
          console.log('Configuracao Mensagem Modal ... ', this.oDadosControleApp.config_modal);
        }

        return (
          <Modal
            animationType="none"
            transparent={true}
            visible={exibir}
            onRequestClose={() => {
              
            }}
          >
            <View style={styles.centeredView}>
              <View style={{...styles.modalView, marginHorizontal:margemHorizontal}}>
                  {this.controlarIndicadorAtividade(indExibirIndicador)}
                  <Text style={styles.modalText}>{mensagem}</Text>
                  <View style={{flexDirection:'row'}}> 
                    {this.montarBotoes()}
                  </View>
              </View>
            </View>
          </Modal>
        )
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
      margin: 40,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      alignSelf:'stretch',
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
      borderRadius: 10,
      padding: 10,
      marginHorizontal: 5,
      elevation: 2
    },
    textStyle: {
      color: "black",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 20,
      fontSize: 16,
      textAlign: "center"
    }
  });