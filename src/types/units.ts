import { Decimal } from 'decimal.js';
import { Entity, SymbolTable } from '../symboltable';

type callbackFuncFmt = () => Decimal | number;

class UnitMeta {
  public id: string;
  public r: Decimal | callbackFuncFmt;
  public b: Decimal | callbackFuncFmt;
  public unitType: string;
  public singular: string;
  public plural: string;
  constructor(id: string, ratio: Decimal | callbackFuncFmt, unitType: string) {
    this.id = id;
    this.r = ratio;
    this.b = new Decimal(0);
    this.unitType = unitType;
    this.plural = unitType;
    this.singular = unitType;
  }

  public get ratio(): Decimal {
    if (this.r instanceof Decimal) {
      return this.r;
    }
    const value = this.r();
    if (value instanceof Decimal) {
      return value;
    }
    return new Decimal(value);
  }

  public get bias(): Decimal {
    if (this.b instanceof Decimal) {
      return this.b;
    }
    const value = this.b();
    if (value instanceof Decimal) {
      return value;
    }
    return new Decimal(value);
  }

  public setBias(value: Decimal | callbackFuncFmt) {
    this.b = value;
  }
  public setPlural(value: string) {
    this.plural = value;
  }
  public setSingular(value: string) {
    this.singular = value;
  }
}

/**
 * Represents unit with info
 */
class Unit {
  public phrases: string[];
  public meta: UnitMeta;
  constructor(id: string, ratio: Decimal | number | string | callbackFuncFmt, unitType: string, phrases: string[]) {
    this.phrases = phrases;
    if (ratio instanceof Decimal || typeof ratio === 'function') {
      this.meta = new UnitMeta(id, ratio, unitType);
      return;
    }
    this.meta = new UnitMeta(id, new Decimal(ratio), unitType);
  }
  public setBias(value: Decimal | number | string | callbackFuncFmt): Unit {
    if (value instanceof Decimal) {
      this.meta.setBias(value);
      return this;
    }
    if (typeof value === 'function') {
      this.meta.setBias(value);
      return this;
    }
    this.meta.setBias(new Decimal(value));
    return this;
  }
  public Plural(value: string): Unit {
    this.meta.setPlural(value);
    return this;
  }
  public Singular(value: string): Unit {
    this.meta.setSingular(value);
    return this;
  }
}

// tslint:disable-next-line:no-namespace
namespace Unit {
  export const LENGTHID = 'LENGTH';
  export const SPEEDID = 'SPEED';
  export const TIMEID = 'TIME';
  export const TEMPERATUREID = 'TIMERATURE';

  /**
   * List of {Unit} sunits
   */
  export class List {
    public symbolTable: SymbolTable;
    public units: { [index: string]: Unit };
    constructor(symbolTable: SymbolTable) {
      this.symbolTable = symbolTable;
      this.units = {};
    }
    /**
     * Add a new unit
     * @param {Unit} unit
     * @throws {FcalError} Error if phrases already exists
     */
    public push(unit: Unit): void {
      for (const phrase1 of unit.phrases) {
        this.symbolTable.set(phrase1, Entity.UNIT);
        this.units[phrase1] = unit;
      }
    }
    /**
     * get the unit by its phrase
     * @param {string} phrase
     * @returns {UnitMeta | null }
     */
    public get(phrase: string): UnitMeta | null {
      if (this.units.hasOwnProperty(phrase)) {
        return this.units[phrase].meta;
      }
      return null;
    }
  }
}

export { Unit, UnitMeta, callbackFuncFmt };
