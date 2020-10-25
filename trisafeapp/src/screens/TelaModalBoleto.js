'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Dimensions,
    View
} from 'react-native';
import { Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import Orientation from 'react-native-orientation';

const NOME_COMPONENTE = 'TelaModalBoleto';
const INSTRUCAO_INICIAL = 'Contratação finalizada. Obrigado.';

export default class TelaModalBoleto extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.inicializarDadosTela = this.inicializarDadosTela.bind(this);
        this.obterBoleto = this.obterBoleto.bind(this);
        this.tratarRetornoBoleto = this.tratarRetornoBoleto.bind(this);
        this.finalizar = this.finalizar.bind(this);
        this.tratarRetornoEmail = this.tratarRetornoEmail.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this.definirDadosPadraoTela = this.definirDadosPadraoTela.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        this.registrarEventoFoco();
        
        this.inicializarDadosTela();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    
    registrarEventoFoco() {
	
        this.oNavegacao.addListener('focus', this.definirDadosPadraoTela);
    }
    
    definirDadosPadraoTela() {
        let nomeFuncao = 'definirDadosPadraoTela';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
    
        Orientation.unlockAllOrientations();

        this.oDadosControleApp.cadastrando_cliente = false;
        this.oDadosControleApp.cadastrando_veiculo = false;
        this.oDadosInstrucao.texto_instrucao = INSTRUCAO_INICIAL;
    
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    inicializarDadosTela() {

        if(this.oGerenciadorContextoApp.temDados() && this.oDadosApp.url_pdf) {
            this.obterBoleto();
        }
    }

    obterBoleto() {
        try {
            let metodoURI = '/boletogerencianets/obter/';

            let oDadosRequisicao = {
                cliente: this.oDadosCliente,
                contrato: this.oDadosContrato,
            }

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarRetornoBoleto, true);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);

        }
    }

    tratarRetornoBoleto(oDados) {
        this.oGerenciadorContextoApp.atribuirDados('boleto', oDados, this);
    }

    finalizar() {
        try {
            let metodoURI = '/emailclientes/enviar_com_anexos/';
            
            let oDadosRequisicao = {
                contrato: this.oDadosContrato,
            }

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarRetornoEmail);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarRetornoEmail() {
        
        this.oNavegacao.navigate('Cadastro', this.state);
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoFinalizar = () => <Button title="Finalizar" onPress={this.finalizar} loading={this.oDadosControleApp.processando_requisicao}></Button>;

    render() {

        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoFinalizar } ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Boleto' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

TelaModalBoleto.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosBoleto = oDadosApp.boleto;
        const source = { 'uri': '' };

        if(oDadosBoleto.url_pdf) {
            source.uri = oDadosBoleto.url_pdf;
        }
        return (
            <View style={styles.areaDadosCliente}>
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath)=>{
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                    }}
                    onError={(error)=>{
                        if(source.uri) {
                            this.oComunicacaoHTTP.obterJsonResposta(error);
                        }
                    }}
                    onPressLink={(uri)=>{
                    }}
                    style={{
                        flex:1,
                        width:Dimensions.get('window').width,
                        height:Dimensions.get('window').height,
                    }}
                />
            </View>
        );
    }
}