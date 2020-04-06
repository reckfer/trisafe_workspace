/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import {
    StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
    areaCliente: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#f5f5f5'
    },
    areaDadosCliente: {
        padding: 10,       
    },
    areaCabecalho: {
        backgroundColor: '#f5f5f5',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    areaTitulo: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    areaCentralizadoEmLinha: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    textoTitulo: {
        fontSize: 20,
        fontWeight: '200',
        color: '#000000',
        textAlign: 'center',
        
    },
    textoNomeTela: {
        fontSize: 28,
        fontWeight: '300',
        color: '#000000',
        textAlign: 'center',
        marginTop: 10,
    },
    botao: {
        padding: 20,
    },
    input: {
        borderColor: '#add8e6'
    },
});

const theme = {
    Input: {
        containerStyle: {
            marginTop: 12,
            backgroundColor: '#fffafa',
            borderRadius: 7,
            alignSelf: 'stretch',
            shadowColor: "#000",

            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
        },
        inputContainerStyle: {
            borderWidth: 0,
            borderColor: 'white',
          },
      },
    Button: {
        buttonStyle: {
            width: 10,
        },
    }
  };

export { styles, theme }