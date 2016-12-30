export class MissingCommentError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `Missing method's comment or params's comment or return comment for ${msg}`;
    this.name = "MissingCommentError";
  }
  
}

export class MissingMethodError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `Missing method for ${msg}`;
    this.name = "MissingMethodError";
  }
  
}

export class MissingPropertyError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `Missing property for ${msg}`;
    this.name = "MissingPropertyError";
  }
  
}

export class CodeFormatError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `Code format error for ${msg}`;
    this.name = "CodeFormatError";
  }
  
}

export class PropertySybolError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `property must end with ${msg}`;
    this.name = "PropertySybolError";
  }
  
}

export class MissingFileError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `Missing file or folder: ${msg}`;
    this.name = "MissingFileError";
  }
  
}

export class RecursionMaxError extends Error {
  public message: string;

  constructor(public msg?: string) {
    super(msg);
    this.message = `There are too more subfolder: ${msg}`;
    this.name = "MissingFileError";
  }
}




