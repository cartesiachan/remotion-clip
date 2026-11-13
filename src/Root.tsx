import { ExplorationLabComposition } from "./Composition";
import { AfterExistenceComposition } from "./AfterExistence";
import { AfterExistenceV2Composition } from "./AfterExistenceV2";
import { PrivatePoolComposition } from "./PrivatePool";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <ExplorationLabComposition />
      <AfterExistenceComposition />
      <AfterExistenceV2Composition />
      <PrivatePoolComposition />
    </>
  );
};
