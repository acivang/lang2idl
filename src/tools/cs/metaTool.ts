

export let getMetaes = (code: string, endValue: string) => {
  let metaes: any = [];
  
  let metaesStart = code.indexOf("[");
  let metaesEnd = code.indexOf(endValue);
  if (metaesStart < metaesEnd) {
    let metaBlocks: any = code.substring(metaesStart, metaesEnd);
    metaBlocks = metaBlocks.match(/\[((\s*?.*?)*?)\]/g);

    metaes.pop();
    for (let meta of metaBlocks) {
      metaes.push({
        type: meta.replace(/\n|\[|\]/g, ''),
        args: {}
      });
    }
  }
  if(metaes.length === 0){
    metaes.push({});
  }
  return metaes;
}