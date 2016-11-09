

export let getMetaes = (code: string, endValue: string) => {
  let metaes: any = [{}];
  
  let metaesStart = code.indexOf("@");
  let metaesEnd = code.indexOf(endValue);
  if (metaesStart < metaesEnd) {
    let metaBlocks: any = code.substring(metaesStart, metaesEnd);
    metaBlocks = metaBlocks.match(/@((\s*?.*?)*?)\n/g);

    metaes.pop();
    for (let i in metaBlocks) {
      metaes.push({
        type: metaes[i].replace(/\n|@/g, ''),
        args: {}
      });
    }
  }

  return metaes;
}