import yfinance as yf
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.db.models import CalendarEvent, WatchlistItem

def parse_iso_date(date_str: str) -> datetime:
    try:
        # Strip trailing 'Z' if present
        if date_str.endswith('Z'):
            date_str = date_str[:-1]
        return datetime.fromisoformat(date_str)
    except Exception:
        return datetime.utcnow()

def sync_watchlist_events(user_id: int, db: Session):
    # 1. Get all watchlist items for the user
    watchlist_items = db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()
    if not watchlist_items:
        return

    for item in watchlist_items:
        symbol = item.symbol
        # If it doesn't end with .NS and it's a popular Indian stock, let's append it
        ticker_symbol = symbol
        if not ticker_symbol.endswith('.NS') and not '.' in ticker_symbol:
            ticker_symbol = f"{ticker_symbol}.NS"
            
        try:
            ticker = yf.Ticker(ticker_symbol)
            
            # --- Sync Earnings ---
            calendar = getattr(ticker, 'calendar', None)
            if isinstance(calendar, dict):
                earnings_dates = calendar.get('Earnings Date', [])
                if isinstance(earnings_dates, list):
                    for e_date in earnings_dates:
                        # e_date is typically a datetime.date or datetime.datetime object
                        event_dt = datetime.combine(e_date, datetime.min.time()) if isinstance(e_date, date) and not isinstance(e_date, datetime) else e_date
                        title = f"{symbol} Earnings Call"
                        
                        # Check duplicate
                        existing = db.query(CalendarEvent).filter(
                            CalendarEvent.user_id == user_id,
                            CalendarEvent.title == title,
                            CalendarEvent.event_date == event_dt
                        ).first()
                        
                        if not existing:
                            event = CalendarEvent(
                                user_id=user_id,
                                title=title,
                                description=f"Quarterly earnings announcement and call scheduled for {symbol}.",
                                event_date=event_dt,
                                event_type="Earnings"
                            )
                            db.add(event)

            # --- Sync Ex-Dividend ---
            if isinstance(calendar, dict):
                ex_div = calendar.get('Ex-Dividend Date')
                if ex_div:
                    event_dt = datetime.combine(ex_div, datetime.min.time()) if isinstance(ex_div, date) and not isinstance(ex_div, datetime) else ex_div
                    title = f"{symbol} Ex-Dividend Date"
                    
                    existing = db.query(CalendarEvent).filter(
                        CalendarEvent.user_id == user_id,
                        CalendarEvent.title == title,
                        CalendarEvent.event_date == event_dt
                    ).first()
                    
                    if not existing:
                        event = CalendarEvent(
                            user_id=user_id,
                            title=title,
                            description=f"Ex-dividend date for corporate action in {symbol}.",
                            event_date=event_dt,
                            event_type="Dividend"
                        )
                        db.add(event)

            # --- Sync Recent Dividends ---
            dividends = getattr(ticker, 'dividends', None)
            if dividends is not None and not dividends.empty:
                # Get the last dividend payout
                last_date = dividends.index[-1]
                val = dividends.iloc[-1]
                event_dt = last_date.to_pydatetime().replace(tzinfo=None)
                title = f"{symbol} Historical Dividend"
                
                existing = db.query(CalendarEvent).filter(
                    CalendarEvent.user_id == user_id,
                    CalendarEvent.title == title,
                    CalendarEvent.event_date == event_dt
                ).first()
                
                if not existing:
                    event = CalendarEvent(
                        user_id=user_id,
                        title=title,
                        description=f"Historical dividend payout: ₹{val:.2f} per share.",
                        event_date=event_dt,
                        event_type="Dividend"
                    )
                    db.add(event)

            # --- Sync Recent Stock Splits ---
            splits = getattr(ticker, 'splits', None)
            if splits is not None and not splits.empty:
                last_date = splits.index[-1]
                val = splits.iloc[-1]
                event_dt = last_date.to_pydatetime().replace(tzinfo=None)
                title = f"{symbol} Stock Split"
                
                existing = db.query(CalendarEvent).filter(
                    CalendarEvent.user_id == user_id,
                    CalendarEvent.title == title,
                    CalendarEvent.event_date == event_dt
                ).first()
                
                if not existing:
                    event = CalendarEvent(
                        user_id=user_id,
                        title=title,
                        description=f"Stock split action. Split ratio: {val}.",
                        event_date=event_dt,
                        event_type="Split"
                    )
                    db.add(event)

            # --- Sync Latest News (top 3) ---
            news_items = getattr(ticker, 'news', [])
            if news_items:
                for item in news_items[:3]:
                    content = item.get('content', {})
                    if not content:
                        continue
                    title_text = content.get('title')
                    if not title_text:
                        continue
                    
                    title = f"{symbol} News: {title_text}"
                    pub_str = content.get('pubDate')
                    event_dt = parse_iso_date(pub_str) if pub_str else datetime.utcnow()
                    
                    # Prevent duplicate news items
                    existing = db.query(CalendarEvent).filter(
                        CalendarEvent.user_id == user_id,
                        CalendarEvent.title == title
                    ).first()
                    
                    if not existing:
                        summary = content.get('summary') or content.get('description') or "No summary available."
                        provider = content.get('provider', {}).get('displayName', 'Market News')
                        url = content.get('canonicalUrl') or content.get('clickThroughUrl') or ""
                        
                        desc = f"{summary}\n\nSource: {provider}"
                        if url:
                            desc += f"\nRead more: {url}"
                            
                        event = CalendarEvent(
                            user_id=user_id,
                            title=title[:100],  # Limit title length
                            description=desc,
                            event_date=event_dt,
                            event_type="News"
                        )
                        db.add(event)
                        
            db.commit()
        except Exception as e:
            print(f"Error syncing events for {symbol}: {e}")
            db.rollback()
