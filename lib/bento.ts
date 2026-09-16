export function getBentoSpanClass(index: number) {
  // A pseudo-random but stable pattern for the bento box layout
  // 0: normal, 1: wide, 2: normal, 3: large (2x2), etc.
  const pattern = index % 14; 
  
  // Large square (2x2)
  if (pattern === 0 || pattern === 7) {
    return "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
  }
  // Tall (1x2)
  if (pattern === 4 || pattern === 11) {
    return "col-span-1 row-span-2 md:col-span-1 md:row-span-2";
  }
  // Wide (2x1)
  if (pattern === 3 || pattern === 13) {
    return "col-span-2 row-span-1 md:col-span-2 md:row-span-1";
  }
  // Normal (1x1)
  return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
}

export function getImageContainerClass(spanClass: string) {
  if (spanClass.includes("row-span-2") || spanClass.includes("col-span-2")) {
    return "h-full w-full"; 
  }
  return "aspect-square";
}

export function getSidebarBentoSpanClass(index: number) {
  const pattern = index % 8;
  if (pattern === 0 || pattern === 6) {
    return "col-span-2 row-span-2"; // 2x2 Big Featured
  }
  if (pattern === 3) {
    return "col-span-2 row-span-1"; // 2x1 Wide
  }
  if (pattern === 4) {
    return "col-span-1 row-span-2"; // 1x2 Tall
  }
  return "col-span-1 row-span-1"; // 1x1 Standard
}

export function getHorizontalBentoSpanClass(index: number) {
  const pattern = index % 8;
  if (pattern === 0 || pattern === 5) {
    return "col-span-2 row-span-2"; // 2x2 Bento Featured
  }
  return "col-span-1 row-span-1"; // 1x1 Bento Standard
}


