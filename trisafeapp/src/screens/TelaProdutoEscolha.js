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
import Util from './../common/Util';
import { ThemeProvider, Button, Card, CheckBox, Divider } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaBotoes from './../common/AreaBotoes';
import { ContextoApp } from '../contexts/ContextoApp';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        
        this.oRegistradorLog.registrar('TelaProdutoEscolha.constructor() => Finalizou.');
        
        this.listarProdutos();
    }

    listarProdutos(){
        try {

            let url = this.oUtil.getURL('/produtos/listar/');
            
            let dadosParametros = JSON.stringify({});

            this.oRegistradorLog.registrar(`TelaProdutoEscolha.listarProdutos => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            fetch(url, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
              })
                .then(this.oUtil.obterJsonResposta)
                .then((oJsonDados) => {
                    this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarListarProdutos, true);
                })
                .catch(function (erro) {
                    Alert.alert(erro.message);
                    throw erro;
                });
        } catch (exc) {
            Alert.alert(exc.message);
            throw exc;
        }
    }

    tratarListarProdutos(oDados, oEstado) {
        
        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            Alert.alert('Nenhum produto TriSafe cadastrado.');
        } else if (oEstado.mensagem && oEstado.mensagem.trim()) {
            Alert.alert(oEstado.mensagem);
        }

        if(oDados && Array.isArray(oDados)) {
            this.oGerenciadorContextoApp.atribuirDados('produtos_contratados', oDados);
            let oProduto;
            let valorTotal = 0.00;

            for(let i = 0; i < oDados.length; i++)  {
            
                oProduto = oDados[i];
                valorTotal += Number.parseFloat(oProduto.valor);
            }
            let oDadosAppGeral = this.oGerenciadorContextoApp.dadosAppGeral;
            
            oDadosAppGeral.dados_app.contrato.valor_total = valorTotal;
            
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
    }

    incluirContrato() {
        try {
            let url = this.oUtil.getURL('/contratos/incluir/');

            this.oDadosControleApp.processando_requisicao = true;

            let dadosParametros = JSON.stringify(this.oDadosApp);            
            this.oRegistradorLog.registrar(`TelaProdutoEscolha.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);

            fetch(url, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.state)
                  })
                  .then(this.oUtil.obterJsonResposta)
                  .then((oJsonDados) => {
                      this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarIncluirContrato);
                  });
        } catch (exc) {
            Alert.alert(exc);
        }
    }

    tratarIncluirContrato(oDados, oEstado) {
        this.oDadosControleApp.processando_requisicao = false;
        
        this.oGerenciadorContextoApp.atribuirDados('contrato', oDados);

        if(oEstado.ok) {
            this.oNavegacao.navigate('Contrato', this.state);
        } else {            
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
    }
    
    voltar() {
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} ></Button>;
    
    render() {
        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoIncluirContrato }];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Produtos' nomeTela='Seleção' />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
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
        );
    }
}