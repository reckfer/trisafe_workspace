import os, email, smtplib, ssl
import traceback
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from trisafeserverapp.settings import BASE_DIR
from comum.retorno import Retorno

class EmailCliente:
    
    def enviar(self, m_contrato):
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

    def enviar_com_anexos(self, m_contrato):
        try:
            retorno = Retorno()

            retorno = m_contrato.gerar_contrato_pdf()

            if not retorno.estado.ok:
                return retorno

            caminho_arquivo = retorno.dados['caminho_arquivo']
            nome_arquivo = retorno.dados['nome_arquivo']

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
            
            # num_contrato = m_contrato.id_contrato
            # nome_arquivo = "Contrato_%s.%s" % (str(num_contrato), "pdf")  # In same directory as script
            
            # caminho_arquivo = os.path.join(BASE_DIR, nome_arquivo)
            
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

            m_contrato.excluir_contrato()

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno