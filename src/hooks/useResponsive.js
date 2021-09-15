import { useMediaQuery } from "react-responsive";

export default (customBreakPoint = 0) => {
  const isTabletLandscape = useMediaQuery({ query: "(max-width: 1150px)" });
  const isTablePotrait = useMediaQuery({ query: "(max-width: 900px)" });
  const isMobileLarge = useMediaQuery({ query: "(max-width: 650px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });
  const isBreakPoint = useMediaQuery({
    query: `(max-width: ${customBreakPoint}px)`,
  });

  return {
    isTabletLandscape,
    isTablePotrait,
    isMobileLarge,
    isMobile,
    isBreakPoint,
  };
};
