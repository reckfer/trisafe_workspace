// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TelaClienteInicio from '../screens/TelaClienteInicio';
import TelaTestesInicio from '../tests/TelaTestesInicio';
import TelaClienteDadosPessoais from '../screens/TelaClienteDadosPessoais';
import TelaClienteEndereco from '../screens/TelaClienteEndereco';
import TelaClienteConfirmacao from '../screens/TelaClienteConfirmacao';
import TelaProdutoEscolha from '../screens/TelaProdutoEscolha';
import TelaContratoAceite from '../screens/TelaContratoAceite';
import TelaBoletoEmissao from '../screens/TelaBoletoEmissao';


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode='none'>
        <Stack.Screen name="Cadastro" component={TelaClienteInicio} />
        <Stack.Screen name="Testes" component={TelaTestesInicio} />
        <Stack.Screen name="Dados pessoais" component={TelaClienteDadosPessoais} />
        <Stack.Screen name="Endereço" component={TelaClienteEndereco} />
        <Stack.Screen name="Confirmação dos dados" component={TelaClienteConfirmacao} />
        <Stack.Screen name="Produtos" component={TelaProdutoEscolha} />
        <Stack.Screen name="Contrato" component={TelaContratoAceite} />
        <Stack.Screen name="Boleto" component={TelaBoletoEmissao} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;