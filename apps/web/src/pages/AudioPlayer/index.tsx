import { useActor } from "@xstate/solid";
import { machine } from "./machine";

type AudioPlayerProps = {};

export const AudioPlayer = (props: AudioPlayerProps) => {
  const [state, send, actor] = useActor(machine, {
    input: {},
  });

  return (
    <div>
      <h1>Audio Player</h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <audio
        crossOrigin="anonymous"
        // src="" // Use this to test "init-error" event
        // src="https://campfire-mode.freecodecamp.org/donate.mp3" // Use this to test "end" event
        src="https://audio.transistor.fm/m/shows/40155/2658917e74139f25a86a88d346d71324.mp3" // Use this to test "play"/"pause" events
        onTimeUpdate={({ currentTarget: audioRef }) =>
          send({ type: "time", params: { updatedTime: audioRef.currentTime } })
        }
        onError={({ type }) =>
          send({ type: "init-error", params: { message: type } })
        }
        onLoadedData={({ currentTarget: audioRef }) =>
          send({ type: "loading", params: { audioRef } })
        }
        onEnded={() => send({ type: "end" })}
      />
      <p>{`Current time: ${state.context.currentTime}`}</p>

      <div>
        {state.matches({ Active: "Paused" }) && (
          <button onClick={() => send({ type: "play" })}>Play</button>
        )}

        {state.matches({ Active: "Playing" }) && (
          <button onClick={() => send({ type: "pause" })}>Pause</button>
        )}

        {state.matches("Active") && (
          <button onClick={() => send({ type: "restart" })}>Restart</button>
        )}
      </div>
    </div>
  );
};
