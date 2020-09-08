/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    ScrollView,
    Alert,
    View,
    Text,
} from 'react-native';
import ComunicacaoHTTP from './../common/ComunicacaoHTTP';
import { ThemeProvider, Button, Card, CheckBox, Divider } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaRodape from './../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Icon from 'react-native-vector-icons/FontAwesome';
import Util from '../common/Util';

export default class TelaProdutoEscolha extends Component {
    
    constructor(props, value) {
        super(props);
    
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaProdutoEscolha.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        this.listarProdutos = this.listarProdutos.bind(this);
        this.tratarListarProdutos = this.tratarListarProdutos.bind(this);
        this.incluirContrato = this.incluirContrato.bind(this);
        this.tratarIncluirContrato = this.tratarIncluirContrato.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'Produtos TriSafe a contratar.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaProdutoEscolha.constructor() => Finalizou.');
    }

    componentDidMount() {
        this.listarProdutos();
    }

    componentDidUpdate() {
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
    }

    listarProdutos(){
        try {
            let metodoURI = '/produtos/listar/';
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarListarProdutos, true);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarListarProdutos(oDados, oEstado) {
        
        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            Alert.alert('Trisafe', 'Nenhum produto TriSafe cadastrado.');
        } else if (oEstado.mensagem && oEstado.mensagem.trim()) {
            Alert.alert('Trisafe', oEstado.mensagem);
        }

        if(oDados && Array.isArray(oDados)) {
            this.oGerenciadorContextoApp.atribuirDados('produtos_contratados', oDados, this);
            let oProduto;
            let valorTotal = 0.00;

            for(let i = 0; i < oDados.length; i++)  {
            
                oProduto = oDados[i];
                valorTotal += Number.parseFloat(oProduto.valor);
            }
            let oDadosAppGeral = this.oGerenciadorContextoApp.dadosAppGeral;
            
            oDadosAppGeral.dados_app.contrato.valor_total = valorTotal;
        }
    }

    incluirContrato() {
        try {
            let metodoURI = '/contratos/incluir/';

            let oDadosParametros = JSON.stringify(this.state);
            
            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarIncluirContrato);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarIncluirContrato(oDados, oEstado) {
        
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);

        if(oEstado.ok) {
            this.oNavegacao.navigate('Contrato', this.state);
        }
    }
    
    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoIncluirContrato }];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Produtos' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} />
            </View>
        );
    }
}
TelaProdutoEscolha.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosContrato = oDadosApp.contrato;
        let listaProdutos = oDadosContrato.produtos_contratados;
        let valorTotal = 0.00;

        if((typeof oDadosContrato.valor_total === 'number') && !isNaN(oDadosContrato.valor_total)) {
            valorTotal = oDadosContrato.valor_total.toFixed(2).replace('.', ',');
        }
                
        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>                    
                        <View>
                            <Card title={<CheckBox title="Serviço de Rastreamento Veicular" checked={true}/>} >
                                <View>
                                {
                                    listaProdutos.map(
                                        (oProduto, indice) => {
                                            let nomeProduto = '';
                                            let valor = 0.00;

                                            if(oProduto.nome) {
                                                nomeProduto = oProduto.nome;
                                            }

                                            if((typeof oProduto.valor === 'number') && !isNaN(oProduto.valor)) {
                                                valor = oProduto.valor.toFixed(2).replace('.', ',');
                                            }
                                            return (
                                                <View key={indice} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                        <CheckBox checked={true} checkedIcon={<Icon name="check" color="#022C18"/>}/>
                                                        <Text>{`${nomeProduto}`}</Text>
                                                    </View>
                                                    <Text style={{fontWeight:'bold'}}>{`R$ ${valor}`}</Text>
                                                </View>
                                            )
                                        }
                                    )
                                }
                                </View>
                                <Divider />
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, marginRight: 10 }}>
                                    <Text style={{fontWeight:'bold'}}>{`Total = R$ ${valorTotal}`}</Text>
                                </View>
                            </Card>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>         
        );
    }
}