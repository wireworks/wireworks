export default class Timer {

	private _paused = false;
	private t: NodeJS.Timeout;
	private loop = false;
	private _delay: number;
	private callback: ()=>void;
	private t0 = 0;
	private totalElapsed = 0;
	private finished = false;

	constructor(callback: ()=>void, delay: number, loop = false, startPaused = false) {
		this.loop = loop;
		this._delay = delay;
		this.callback = callback;

		this.totalElapsed = 0;
		this.mark();
		this.tick();		

		if (startPaused) this.paused = true;
	}

	private tick = (prerun = 0) => {
		if (!this.finished) {
			
			this.t = setTimeout(() => {
				
				if (!this._paused) {					
					this.mark();
					this.totalElapsed = 0;
					this.callback();
					if (this.loop) this.tick();
					else this.finished = true;
				}
	
			}, Math.floor(1000*this._delay) - prerun);
		}
	}

	private mark = () => { 
		let t1 = Math.floor(performance.now());
		let elapsed = t1 - this.t0;
		this.t0 = t1;
		return elapsed;
	}

	set paused(pause: boolean) {	
				
		if (pause != this._paused) {

			if (pause) {
				this.clear();
				this.totalElapsed += this.mark();
			}
			else if (!this.finished) {
	
				this.mark();
				this.tick(this.totalElapsed);			
	
			}

		}

		this._paused = pause;

	}

	get paused() {
		return this._paused;
	}

	set delay(del: number) {
		let ratio = del / this._delay;
		if (!this.paused){
			this.paused = true;
			this.totalElapsed = Math.floor(this.totalElapsed * ratio);
			this._delay = del;
			this.paused = false;
		}
		else {
			this.totalElapsed = Math.floor(this.totalElapsed * ratio);
			this._delay = del;
		}
	}

	clear = () => {
		clearTimeout(this.t);
		this.t = undefined;
	}
}