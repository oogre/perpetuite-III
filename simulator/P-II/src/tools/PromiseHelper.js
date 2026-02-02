export default class PromiseHelper{
  static Pending = 0;
  static Fullfill = 1;
  static Rejected = 2;
  constructor(callback){
    this._callback = callback;
    this.reset();
  }
  reset(){
    this._promise = new Promise((res, rej)=>{
      this._resolve = res;
      this._reject = rej;
    }).then(()=>this._callback());
  }
  get resolve(){
    return this._resolve;
  }
  get reject(){
    return this._reject;
  }
  get promise(){
    return this._promise;
  }
  state(){
    const t = {};
    return Promise.race([this.promise, t])
      .then(v => (v === t) ? PromiseHelper.Pending : PromiseHelper.Fullfill, () => PromiseHelper.Rejected)
  }
  async isPending(){
    const s = await this.state();
    return s === PromiseHelper.Pending;
  }
  async isFullfill(){
    const s = await this.state();
    return s === PromiseHelper.Fullfill;
  }
  async isRejected(){
    const s = await this.state();
    return s === PromiseHelper.Rejected;
  }
}