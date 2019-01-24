import { Injectable } from '@nestjs/common';
import Parser, { Output } from 'rss-parser';
import normalizeUrl from 'normalize-url';

@Injectable()
export class RssService {
  private parser = new Parser();

  async parseUrl(url: string) {
    let normalized;
    try {
      normalized = normalizeUrl(url);
    } catch (error) {
      throw new Error(`${url} is not a valid url`);
    }

    let rssFeed: Output;
    try {
      rssFeed = await this.parser.parseURL(normalized);
    } catch (error) {
      throw new Error(`Could not parse ${url} as a rss feed.`);
    }

    return rssFeed;
  }
}
