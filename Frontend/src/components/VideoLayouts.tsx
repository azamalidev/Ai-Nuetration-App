
import {
  PaginatedGridLayout,
  SpeakerLayout,

} from "@stream-io/video-react-sdk";

/**
 * STYLE_CLEAN
 * Equal grid layout for all participants
 */
export function CleanLayout() {
  return (
    <div style={{ flex: 1, background: "#111", padding: "10px" }}>
      <PaginatedGridLayout />
    </div>
  );
}

/**
 * STYLE_ZOOM
 * Speaker main view + participants bar
 */
export function ZoomLayout() {
  return (
    <div style={{ flex: 1, background: "#101010", padding: "10px" }}>
      <SpeakerLayout
        participantsBarPosition="bottom"
        participantsBarLimit={6}
        mirrorLocalParticipantVideo
      />
    </div>
  );
}

/**
 * STYLE_TEAMS
 * Microsoft Teams style floating picture-in-picture
//  */
// export function TeamsLayout() {
//   return (
//     <div style={{ flex: 1, background: "#0f0f11", padding: "10px" }}>
//       <PipLayout
//        Pip={}
//       />
//     </div>
//   );
// }

