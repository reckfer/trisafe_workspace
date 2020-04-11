import os, email, smtplib, ssl

from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from trisafeserverapp.settings import BASE_DIR

class EmailCliente:
    
    def enviar(self, m_cliente):
        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "nandorex@gmail.com"  # Enter your address
        receiver_email = "fernando.r@outlook.com"  # Enter receiver address
        password = "asztgusvpybxlfxm"
        message = """\
        Subject: Bem vindo a TriSafe

        This message is sent from Python."""

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)

    def enviarComAnexos(self, m_cliente):
        subject = "Bem vindo a TriSafe"
        body = "Veja seus anexos."
        smtp_server = "smtp.gmail.com"
        sender_email = "nandorex@gmail.com"
        receiver_email = "fernando.r@outlook.com"
        password = "asztgusvpybxlfxm"

        # Create a multipart message and set headers
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = receiver_email
        message["Subject"] = subject
        # message["Bcc"] = receiver_email  # Recommended for mass emails

        # Add body to email
        message.attach(MIMEText(body, "plain"))

        nome_arquivo = "Contrato_0089910001007874.pdf"  # In same directory as script
        caminho_arquivo = os.path.join(BASE_DIR, nome_arquivo)
        
        # Open PDF file in binary mode
        with open(caminho_arquivo, "rb") as attachment:
            # Add file as application/octet-stream
            # Email client can usually download this automatically as attachment
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())

        # Encode file in ASCII characters to send by email    
        encoders.encode_base64(part)

        # Add header as key/value pair to attachment part
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {nome_arquivo}",
        )

        # Add attachment to message and convert message to string
        message.attach(part)
        text = message.as_string()

        # Log in to server using secure context and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, 465, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, text)

    # def obter(self):
    #     try:
    #         retorno = Cliente.validar_dados_obrigatorios_chaves(self)
                
    #         if not retorno.estado.ok:
    #             return retorno

    #         retorno = Retorno(False, 'Cliente não cadastrado', 'NaoCadastrado', 406)
            
    #         # Valida se o cliente já está cadastrado.
    #         lista_clientes = Cliente.objects.filter(cpf=self.cpf)
    #         if lista_clientes:
    #             m_cliente = lista_clientes[0]
    #             if m_cliente:
    #                 # Obtem o cadastro na Iter.
    #                 retorno_cliente_iter = ClienteIter.obter(self, m_cliente.id_cliente_iter)
                    
    #                 if not retorno_cliente_iter.estado.ok:
    #                     return retorno_cliente_iter
                    
    #                 self.converter_de_cliente_iter(retorno_cliente_iter.json())
                    
    #                 retorno = Retorno(True)
    #                 retorno.dados = self
            
    #         return retorno
    #     except Exception as e:
    #         print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
    #         retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
    #         return retorno

    # def obter_ultimo(self):
    #     try:
    #         retorno = Retorno(False)
    #         # Valida se o cliente já está cadastrado.
    #         lista_clientes = Cliente.objects.filter()
    #         if lista_clientes:
    #             m_cliente = lista_clientes[lista_clientes.count()-1]
    #             if m_cliente:
    #                 # Obtem o cadastro na Iter.
    #                 retorno_cliente_iter = ClienteIter.obter(self, m_cliente.id_cliente_iter)
                    
    #                 if not retorno_cliente_iter.estado.ok:
    #                     return retorno_cliente_iter
                    
    #                 self.converter_de_cliente_iter(retorno_cliente_iter.json())
                    
    #                 retorno = Retorno(True)
    #                 retorno.dados = self
            
    #         return retorno
    #     except Exception as e:
    #         print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
    #         retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
    #         return retorno

    # def validar_dados_obrigatorios_chaves(self):
    #     if len(str(self.cpf).strip()) <= 0 and len(str(self.email).strip()) <= 0:
    #         return Retorno(False, "Informe o CPF e/ou E-Mail.", 406)

    #     return Retorno(True)
    
    # def validar_dados_obrigatorios(self):
        
    #     retorno = Cliente.validar_dados_obrigatorios_chaves(self)
            
    #     if not retorno.estado.ok:
    #         return retorno

    #     if len(str(self.nome).strip()) <= 0:
    #         return Retorno(False, "Informe o nome.", 406)
    #     return Retorno(True)
    
    # def json(self):
    #     return self.__criar_json__()

    # def __criar_json__(self):
    #     ret = {
    #         "id_cliente_iter": self.id_cliente_iter,
    #         "nome": self.nome,
    #         "nome_usuario": self.nome_usuario,
    #         "cpf": self.cpf,
    #         "rg": self.rg,
    #         "rua": self.rua,
    #         "numero": self.numero,
    #         "cep": self.cep,
    #         "bairro": self.bairro,
    #         "cidade": self.cidade,
    #         "uf": self.uf,
    #         "telefone": self.telefone,
    #         "email": self.email,
    #         }
    #     return ret

    # def __str__(self):
    #     return self.nome