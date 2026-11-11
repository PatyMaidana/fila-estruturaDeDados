import "./StatusSistema.css";
import { useEffect, useRef } from "react";
import filaVazia from "../assets/mascote/fila-vazia.png";
import filaIniciada from "../assets/mascote/fila-iniciada.png";
import filaEnchendo from "../assets/mascote/fila-enchendo.png";
import filaCheiaAlerta from "../assets/mascote/fila-cheia-alerta.png";
import filaCheia from "../assets/mascote/fila-cheia.png";

type Status = {
  quantidade: number;
  capacidade: number;
  lotada: boolean;
};

type Props = {
  status: Status;
  alterarCapacidade: (novaCapacidade: number) => void;
};

  function obterMascote(percentual: number) {
    if (percentual === 0) {
      return {
        imagem: filaVazia,
        estado: "vazia",
        mensagem: "Fila vazia",
      };
    }

    if (percentual <= 30) {
      return {
        imagem: filaIniciada,
        estado: "iniciada",
        mensagem: "Atendimentos iniciados",
      };
    }

    if (percentual < 70) {
      return {
        imagem: filaEnchendo,
        estado: "enchendo",
        mensagem: "Fila em andamento",
      };
    }

    if (percentual < 100) {
      return {
        imagem: filaCheiaAlerta,
        estado: "alerta",
        mensagem: "Capacidade elevada",
      };
    }

    return {
      imagem: filaCheia,
      estado: "cheia",
      mensagem: "Fila lotada",
    };
  }
  
function StatusSistema({ status, alterarCapacidade }: Props) {
  const percentual =
    status.capacidade > 0 ? (status.quantidade / status.capacidade) * 100 : 0;

const tocouAlarme = useRef(false);
const mascote = obterMascote(percentual);



  function tocarAlarme() {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime);

    gain.gain.setValueAtTime(0.12, audioContext.currentTime);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.frequency.setValueAtTime(720, audioContext.currentTime + 0.18);

    oscillator.frequency.setValueAtTime(520, audioContext.currentTime + 0.36);

    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.55,
    );

    oscillator.stop(audioContext.currentTime + 0.55);
  }

  useEffect(() => {
    if (status.lotada && !tocouAlarme.current) {
      tocarAlarme();
      tocouAlarme.current = true;
    }

    if (!status.lotada) {
      tocouAlarme.current = false;
    }
  }, [status.lotada]);

  return (
    <section className="painel painel-status">
      <div className="status-cabecalho">
        <span className="status-codigo">SYS-STATUS</span>
        <h2>Status do sistema</h2>
      </div>

      <div className="status-indicador">
        <span
          className={`status-led ${status.lotada ? "status-led-alerta" : ""}`}
        />

        <span>
          {status.lotada ? "CAPACIDADE MÁXIMA" : "SISTEMA DISPONÍVEL"}
        </span>
      </div>

      <div className="status-capacidade">
        <div className="status-numeros">
          <span>Ocupação</span>

          <strong>
            {status.quantidade} / {status.capacidade}
          </strong>
        </div>

        <div className="status-barra">
          <div
            className={`status-progresso ${
              status.lotada ? "status-progresso-alerta" : ""
            }`}
            style={{
              width: `${percentual}%`,
            }}
          />
        </div>

        <div className="controle-capacidade">
          <span>Capacidade máxima</span>

          <div className="controle-capacidade-acoes">
            <button
              type="button"
              onClick={() => alterarCapacidade(status.capacidade - 1)}
            >
              -
            </button>

            <strong>{status.capacidade}</strong>

            <button
              type="button"
              onClick={() => alterarCapacidade(status.capacidade + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className={`mascote-status mascote-${mascote.estado}`}>
          <div className="mascote-monitor">
            <img
              key={mascote.estado}
              src={mascote.imagem}
              alt={mascote.mensagem}
            />
          </div>

          <div className="mascote-legenda">
            <span>QUEUE MONITOR</span>
            <strong>{mascote.mensagem}</strong>
          </div>
        </div>

        <span className="status-percentual">{Math.round(percentual)}%</span>
      </div>

      {status.lotada && (
        <div className="status-alerta">
          <strong>⚠ ALARME</strong>

          <p>Limite da fila circular atingido.</p>
        </div>
      )}
    </section>
  );
}

export default StatusSistema;
