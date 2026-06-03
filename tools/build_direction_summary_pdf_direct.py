from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path("/Users/book/Documents/auto-cs-bot-ver-1")
OUT = ROOT / "deliverables" / "hk-sme-dm-sales-cockpit-direction-summary.pdf"


FONT = "ArialUnicode"
pdfmetrics.registerFont(TTFont(FONT, "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))


def p(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def bullet(text, style):
    return Paragraph(f"- {text}", style)


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawString(18 * mm, 12 * mm, "HK SME DM Sales Cockpit Direction Summary")
    canvas.drawRightString(192 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=FONT,
            fontSize=23,
            leading=29,
            textColor=colors.HexColor("#102333"),
            alignment=TA_LEFT,
            spaceAfter=7 * mm,
            wordWrap="CJK",
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#225E8A"),
            spaceAfter=6 * mm,
            wordWrap="CJK",
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=FONT,
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#225E8A"),
            spaceBefore=6 * mm,
            spaceAfter=3 * mm,
            wordWrap="CJK",
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT,
            fontSize=11.5,
            leading=15,
            textColor=colors.HexColor("#102333"),
            spaceBefore=4 * mm,
            spaceAfter=2 * mm,
            wordWrap="CJK",
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=10.2,
            leading=15,
            textColor=colors.HexColor("#1F2933"),
            spaceAfter=2.8 * mm,
            wordWrap="CJK",
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.4,
            leading=12,
            textColor=colors.HexColor("#64707D"),
            spaceAfter=2 * mm,
            wordWrap="CJK",
        ),
        "callout": ParagraphStyle(
            "callout",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#102333"),
            spaceAfter=0,
            wordWrap="CJK",
        ),
        "table": ParagraphStyle(
            "table",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.4,
            leading=11.2,
            textColor=colors.HexColor("#1F2933"),
            wordWrap="CJK",
        ),
        "table_header": ParagraphStyle(
            "table_header",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.8,
            leading=11.5,
            textColor=colors.HexColor("#102333"),
            wordWrap="CJK",
        ),
    }


def callout(text, st, fill="#EAF5EF"):
    table = Table([[p(text, st["callout"])]], colWidths=[174 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(fill)),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#C8D8D1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def comparison_table(st):
    data = [
        ["項目", "Omnichat", "我們應該做"],
        ["定位", "大型品牌 chat commerce / omnichannel platform", "香港小店 DM 漏客偵測 + 成交跟進系統"],
        ["客戶", "Fortress、Watsons、FILA、Timberland 等大品牌", "每天 20-100 個 IG/WhatsApp 查詢的小店"],
        ["價格", "公開頁只寫 Quote，annual subscription，另計 API/message fee", "透明月費、可月付、低 setup 成本"],
        ["功能", "CDP、broadcast、journey、coupon/game、OMO sales", "inbox、AI 草稿、lead status、跟進提醒、每日報告"],
        ["風險", "功能完整但重，需要 onboarding 和整合", "避免普通 chatbot，先打中一個尖痛點"],
    ]
    return make_table(data, st, [24 * mm, 72 * mm, 78 * mm], "#F4F6F8")


def roadmap_table(st):
    data = [
        ["階段", "要做什麼", "目的"],
        ["MVP 1", "DM Inbox Lite + AI 草稿 + 安全檢查", "證明可以幫員工快回，而且不亂承諾"],
        ["MVP 2", "Lead 狀態：新查詢 / 高意向 / 等付款 / 已成交 / 投訴風險", "把 DM 變成可管理的 pipeline"],
        ["MVP 3", "每日老闆報告：漏客、hot leads、等付款、未回覆", "讓老闆每天看到工具價值"],
        ["MVP 4", "美容院 booking 或 IG shop order template", "先做一個垂直場景，打出案例"],
        ["MVP 5", "Dashboard + staff ownership + follow-up reminder", "由 AI chatbot 變成生意跟進系統"],
    ]
    return make_table(data, st, [24 * mm, 82 * mm, 68 * mm], "#EAF5EF")


def make_table(data, st, widths, header_fill):
    formatted = []
    for r, row in enumerate(data):
        style = st["table_header"] if r == 0 else st["table"]
        formatted.append([p(str(cell), style) for cell in row])
    table = Table(formatted, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_fill)),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCD2D8")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def build():
    st = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=18 * mm,
        title="HK SME DM Sales Cockpit Direction Summary",
        author="Codex",
    )
    story = []

    story.append(p("我們的方向：不要做普通 Chatbot", st["title"]))
    story.append(p("建議定位：香港小店用得起的 IG/WhatsApp 漏客偵測 + DM 成交跟進系統", st["subtitle"]))
    story.append(callout("一句話：我們不賣「AI 自動回覆」。我們賣「幫小店搵返 IG/WhatsApp 入面漏咗嘅生意」。", st))
    story.append(Spacer(1, 5 * mm))

    story.append(p("1. 核心判斷", st["h1"]))
    for item in [
        "Instagram 上已經有大量 chatbot。只講 24/7、AI、WhatsApp/IG、CRM、broadcast，會變成同質化產品。",
        "Omnichat 已經把大型品牌需要的 chat commerce、CDP、marketing automation、OMO sales 做得很完整。",
        "我們不應正面複製 Omnichat，而是切入它太重、太貴、太 enterprise 的市場空位。",
        "小店老闆真正痛點不是「想要 chatbot」，而是：有沒有漏客、誰最有機會成交、誰等付款、誰需要員工跟進。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("2. Omnichat vs 我們", st["h1"]))
    story.append(comparison_table(st))

    story.append(PageBreak())
    story.append(p("3. 產品方向", st["h1"]))
    story.append(callout("產品方向：HK SME DM Sales Cockpit，把 IG/WhatsApp 對話變成可追蹤的生意 pipeline。", st, "#EAF3F8"))
    story.append(Spacer(1, 4 * mm))
    for item in [
        "Unified DM Inbox Lite：先支援 IG / WhatsApp / Website 的其中 1-2 個，不追求一開始全渠道。",
        "AI Reply Draft：AI 先寫草稿，危險內容如退款、療程效果、付款確認、booking confirmation 交人處理。",
        "Lead Status：每個客自動分類為新查詢、高意向、等付款、等確認、已成交、投訴風險。",
        "Follow-up Reminder：客人問完價、問完 booking、問完付款後未回，就提醒員工或老闆。",
        "Daily Boss Report：每天列出漏客、hot leads、等付款、未回覆、常見問題。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("4. 為什麼這方向比較易打市場", st["h1"]))
    for item in [
        "比「AI chatbot」更尖：客人一聽就明白是在防止漏單，而不是又一個自動回覆工具。",
        "比 Omnichat 輕：不用先做 full CDP、loyalty、game、enterprise integration。",
        "比純 inbox 有價值：系統會幫老闆判斷 priority，而不是只把 message 集中在一起。",
        "比人工更可控：AI 只負責整理、草稿、分類，真正高風險內容交員工決定。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("5. MVP Roadmap", st["h1"]))
    story.append(roadmap_table(st))

    story.append(PageBreak())
    story.append(p("6. 第一個市場建議", st["h1"]))
    story.append(callout("先打：每天有 20-100 個 IG/WhatsApp 查詢，但未大到願意買 Omnichat 的香港小店。", st, "#FFF4DF"))
    story.append(Spacer(1, 4 * mm))
    for item in [
        "首選：美容院 / 美甲 / 醫美小店。原因：booking、問價、優惠、投訴風險、療程承諾都集中在 DM。",
        "第二選：IG shop。原因：現貨、尺碼、順豐、自取、付款、出貨、退貨都靠 DM，容易漏單。",
        "第三選：教育中心 / 補習社。原因：試堂、課程查詢、家長跟進、退款和承諾風險高。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("7. 建議定價", st["h1"]))
    for item in [
        "Starter：HK$299-499/月，AI 草稿、基本 inbox、每日漏客報告。",
        "Growth：HK$799-999/月，加入 lead pipeline、follow-up reminder、booking/order/payment status。",
        "Setup：HK$1,500-3,000 一次性，幫店舖整理 FAQ、服務、價錢、規則、風險字眼。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("8. Instagram 內容方向", st["h1"]))
    for item in [
        "不要拍「我們有 AI chatbot」。要拍「你今日漏咗幾多 DM 生意？」",
        "內容例子：美容院最易漏單的 5 種 DM、IG shop 客人問完有冇貨之後點追、每日收工前應該看的漏客清單。",
        "Demo 畫面重點：hot leads、等付款、未回覆、投訴風險、今日建議先跟進的 5 個客。",
    ]:
        story.append(bullet(item, st["body"]))

    story.append(p("9. 最終方向", st["h1"]))
    story.append(callout("Recommendation：不要做 Omnichat clone。做 Omnichat 不想服務的小店市場：更輕、更平、更快上手，主打「不漏客」和「DM 轉成交」。", st))
    story.append(p("參考資料：Omnichat 官方 pricing page；Omnichat guest sharing slides；前期香港 SME / consumer messaging research。", st["small"]))

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(OUT)


if __name__ == "__main__":
    build()
